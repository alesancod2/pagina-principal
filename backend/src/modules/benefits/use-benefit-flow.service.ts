import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Benefit, BenefitType } from './entities/benefit.entity';
import { BenefitUsage } from './entities/benefit-usage.entity';
import { Association } from '../users/entities/association.entity';
import { CouponsService } from '../coupons/coupons.service';
import { PointsService } from '../points/points.service';

export interface UseBenefitFlowDto {
  benefitId: string;
  partnerId: string;
  amount?: number;
  notes?: string;
}

export interface UseBenefitFlowResult {
  usage: BenefitUsage;
  couponCode: string;
  couponExpiresAt: Date;
  pointsEarned: number;
  discountApplied: number;
  discountType: string;
  benefitTitle: string;
  partnerName?: string;
}

/**
 * Servico orquestrador que executa o fluxo completo de uso de beneficio:
 * 1. Valida associacao (ativa + adimplente)
 * 2. Valida beneficio (ativo, datas, max_uses)
 * 3. Verifica regras de dia da semana
 * 4. Gera cupom via CouponsService
 * 5. Registra uso em benefit_usages
 * 6. CREDITA pontos via PointsService (pontos sao GANHOS, nunca exigidos)
 * 7. Retorna resposta completa
 *
 * IMPORTANTE: Este fluxo NAO verifica saldo de pontos do usuario.
 * A utilizacao de beneficio e LIVRE para qualquer associado ativo e adimplente.
 * Pontos sao apenas ACUMULADOS (creditados) ao associado apos o uso.
 * O campo pointsRequired pertence ao fluxo SEPARADO de resgate (POST /points/redeem).
 */
@Injectable()
export class UseBenefitFlowService {
  constructor(
    @InjectRepository(Benefit)
    private readonly benefitRepository: Repository<Benefit>,
    @InjectRepository(BenefitUsage)
    private readonly usageRepository: Repository<BenefitUsage>,
    @InjectRepository(Association)
    private readonly associationRepository: Repository<Association>,
    private readonly couponsService: CouponsService,
    private readonly pointsService: PointsService,
  ) {}

  /**
   * Executa o fluxo completo de uso de beneficio
   * NAO exige pontos - apenas CREDITA pontos ao associado
   */
  async execute(userId: string, dto: UseBenefitFlowDto): Promise<UseBenefitFlowResult> {
    // IMPORTANTE: NAO verificar saldo de pontos do usuario.
    // Utilizacao de beneficio e LIVRE - pontos sao apenas GANHOS.

    // 1. Validar associacao do usuario (ativa + adimplente)
    await this.validateAssociation(userId);

    // 2. Buscar e validar beneficio
    const benefit = await this.validateBenefit(dto.benefitId);

    // 3. Verificar regras de dia da semana
    this.validateDayOfWeek(benefit);

    // 4. Verificar limite de uso por usuario
    await this.validateUserUsageLimit(userId, benefit);

    // 5. Gerar cupom via CouponsService
    const coupon = await this.couponsService.generateCoupon(
      userId,
      benefit.id,
      dto.partnerId,
    );

    // 6. Calcular desconto
    const discountApplied = this.calculateDiscount(benefit, dto.amount);
    const discountType = this.getDiscountTypeLabel(benefit.benefitType);

    // 7. Calcular pontos gerados
    const pointsEarned = benefit.pointsGenerated || 0;

    // 8. Registrar uso em benefit_usages
    const usage = this.usageRepository.create({
      userId,
      partnerId: dto.partnerId,
      benefitId: benefit.id,
      couponId: coupon.id,
      amount: dto.amount || null,
      discountApplied,
      pointsEarned,
      notes: dto.notes || null,
      usedAt: new Date(),
    });

    const savedUsage = await this.usageRepository.save(usage);

    // 9. Incrementar current_uses no beneficio
    await this.benefitRepository.increment({ id: benefit.id }, 'currentUses', 1);

    // 10. Gerar pontos via PointsService - CREDITAR ao associado (se aplicavel)
    // Pontos sao ACUMULADOS a cada uso de beneficio (nunca debitados neste fluxo)
    if (pointsEarned > 0) {
      await this.pointsService.addPoints(
        userId,
        pointsEarned,
        dto.partnerId,
        `Pontos ganhos: ${benefit.title}`,
      );
    }

    return {
      usage: savedUsage,
      couponCode: coupon.code,
      couponExpiresAt: coupon.expiresAt,
      pointsEarned,
      discountApplied,
      discountType,
      benefitTitle: benefit.title,
      partnerName: benefit.partner?.companyName || undefined,
    };
  }

  /**
   * Validar se o usuario possui associacao ativa e adimplente
   */
  private async validateAssociation(userId: string): Promise<void> {
    const association = await this.associationRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!association) {
      throw new ForbiddenException(
        'Voce nao possui associacao ativa com a Auto Vale Prevencoes.',
      );
    }

    if (association.status !== 'active') {
      throw new ForbiddenException(
        'Sua associacao nao esta ativa. Entre em contato com a Auto Vale Prevencoes.',
      );
    }

    if (!association.isCompliant) {
      throw new ForbiddenException(
        'Regularize sua associacao para utilizar os beneficios exclusivos do Clube Auto Vale.',
      );
    }
  }

  /**
   * Validar se o beneficio esta ativo e dentro das datas
   */
  private async validateBenefit(benefitId: string): Promise<Benefit> {
    const benefit = await this.benefitRepository.findOne({
      where: { id: benefitId },
      relations: ['partner'],
    });

    if (!benefit) {
      throw new BadRequestException('Beneficio nao encontrado.');
    }

    if (!benefit.isActive) {
      throw new BadRequestException('Este beneficio nao esta mais ativo.');
    }

    const today = new Date();
    if (benefit.startDate && new Date(benefit.startDate) > today) {
      throw new BadRequestException('Este beneficio ainda nao esta disponivel.');
    }
    if (benefit.endDate && new Date(benefit.endDate) < today) {
      throw new BadRequestException('Este beneficio ja expirou.');
    }

    // Validar max_uses total
    if (benefit.maxUses && benefit.currentUses >= benefit.maxUses) {
      throw new BadRequestException(
        'Este beneficio atingiu o limite maximo de utilizacoes.',
      );
    }

    return benefit;
  }

  /**
   * Validar se o beneficio esta disponivel no dia da semana atual
   */
  private validateDayOfWeek(benefit: Benefit): void {
    const today = new Date();
    // JS getDay(): 0=domingo ... 6=sabado
    // Converter para: 1=segunda ... 7=domingo
    const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
    const availableDays = benefit.daysAvailable.split(',').map(Number);

    if (!availableDays.includes(dayOfWeek)) {
      throw new BadRequestException(
        'Beneficio nao disponivel hoje. Verifique os dias de disponibilidade.',
      );
    }
  }

  /**
   * Validar limite de uso por usuario
   */
  private async validateUserUsageLimit(userId: string, benefit: Benefit): Promise<void> {
    if (benefit.maxUsesPerUser) {
      const userUsageCount = await this.usageRepository.count({
        where: { userId, benefitId: benefit.id },
      });
      if (userUsageCount >= benefit.maxUsesPerUser) {
        throw new BadRequestException(
          'Voce ja atingiu o limite de utilizacoes deste beneficio.',
        );
      }
    }
  }

  /**
   * Calcular desconto com base no tipo de beneficio
   */
  private calculateDiscount(benefit: Benefit, amount?: number): number {
    if (!amount) return 0;

    switch (benefit.benefitType) {
      case BenefitType.DISCOUNT_PERCENT:
        return (amount * (benefit.discountPercent || 0)) / 100;
      case BenefitType.DISCOUNT_FIXED:
        return benefit.discountFixed || 0;
      case BenefitType.CASHBACK:
        return (amount * (benefit.cashbackPercent || 0)) / 100;
      default:
        return 0;
    }
  }

  /**
   * Obter label do tipo de desconto
   */
  private getDiscountTypeLabel(type: BenefitType): string {
    switch (type) {
      case BenefitType.DISCOUNT_PERCENT:
        return 'Desconto percentual';
      case BenefitType.DISCOUNT_FIXED:
        return 'Desconto fixo';
      case BenefitType.CASHBACK:
        return 'Cashback';
      case BenefitType.POINTS:
        return 'Pontos';
      case BenefitType.FREEBIE:
        return 'Brinde';
      default:
        return 'Desconto';
    }
  }
}
