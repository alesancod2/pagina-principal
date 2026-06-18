import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Benefit, BenefitType } from './entities/benefit.entity';
import { BenefitUsage } from './entities/benefit-usage.entity';
import { UsageRequest, UsageStatus } from './entities/usage-request.entity';
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
  usageRequest: UsageRequest;
  usageCode: string;
  pointsToCredit: number;
  benefitTitle: string;
  partnerName?: string;
  message: string;
}

export interface ConfirmUsageResult {
  usageRequest: UsageRequest;
  pointsCredited: number;
  message: string;
}

export interface UsageFilters {
  status?: UsageStatus;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Servico orquestrador que executa o fluxo de uso de beneficio SEM voucher unico:
 *
 * NOVO FLUXO:
 * 1. Associado clica "Utilizar" -> gera codigo simples (AUTOVALE-XXXX)
 * 2. Status: PENDENTE - pontos NAO sao creditados ainda
 * 3. Parceiro localiza e CONFIRMA a utilizacao no painel
 * 4. SOMENTE apos confirmacao: pontos creditados ao associado
 * 5. Historico registrado com codigo, status, data
 *
 * IMPORTANTE: Pontos NAO sao creditados imediatamente.
 * Somente apos confirmacao do parceiro.
 */
@Injectable()
export class UseBenefitFlowService {
  constructor(
    @InjectRepository(Benefit)
    private readonly benefitRepository: Repository<Benefit>,
    @InjectRepository(BenefitUsage)
    private readonly usageRepository: Repository<BenefitUsage>,
    @InjectRepository(UsageRequest)
    private readonly usageRequestRepository: Repository<UsageRequest>,
    @InjectRepository(Association)
    private readonly associationRepository: Repository<Association>,
    private readonly couponsService: CouponsService,
    private readonly pointsService: PointsService,
  ) {}

  /**
   * Gera um codigo simples de utilizacao no formato AUTOVALE-XXXX
   */
  private generateUsageCode(): string {
    const number = Math.floor(1000 + Math.random() * 9000);
    return `AUTOVALE-${number}`;
  }

  /**
   * Executa o fluxo de solicitacao de uso de beneficio
   * NAO credita pontos - apenas cria a solicitacao com status PENDENTE
   */
  async execute(userId: string, dto: UseBenefitFlowDto): Promise<UseBenefitFlowResult> {
    // 1. Validar associacao do usuario (ativa + adimplente)
    await this.validateAssociation(userId);

    // 2. Buscar e validar beneficio
    const benefit = await this.validateBenefit(dto.benefitId);

    // 3. Verificar regras de dia da semana
    this.validateDayOfWeek(benefit);

    // 4. Verificar limite de uso por usuario
    await this.validateUserUsageLimit(userId, benefit);

    // 5. Gerar codigo simples de utilizacao
    const usageCode = this.generateUsageCode();

    // 6. Calcular pontos que serao creditados APOS confirmacao
    const pointsToCredit = benefit.pointsGenerated || 0;

    // 7. Criar solicitacao de uso com status PENDENTE
    const usageRequest = this.usageRequestRepository.create({
      userId,
      partnerId: dto.partnerId,
      benefitId: benefit.id,
      usageCode,
      status: UsageStatus.PENDING,
      pointsToCredit,
    });

    const savedRequest = await this.usageRequestRepository.save(usageRequest);

    // 8. Incrementar current_uses no beneficio
    await this.benefitRepository.increment({ id: benefit.id }, 'currentUses', 1);

    // IMPORTANTE: Pontos NAO sao creditados aqui!
    // Somente apos confirmacao do parceiro via confirmUsage()

    return {
      usageRequest: savedRequest,
      usageCode,
      pointsToCredit,
      benefitTitle: benefit.title,
      partnerName: benefit.partner?.companyName || undefined,
      message: `Solicitacao registrada! Codigo: ${usageCode}. Apresente ao parceiro para confirmacao. Pontos serao creditados apos confirmacao.`,
    };
  }

  /**
   * Parceiro CONFIRMA a utilizacao - somente agora os pontos sao creditados
   */
  async confirmUsage(requestId: string, confirmedBy: string): Promise<ConfirmUsageResult> {
    const usageRequest = await this.usageRequestRepository.findOne({
      where: { id: requestId },
      relations: ['benefit', 'user'],
    });

    if (!usageRequest) {
      throw new NotFoundException('Solicitacao de utilizacao nao encontrada.');
    }

    if (usageRequest.status !== UsageStatus.PENDING) {
      throw new BadRequestException(
        `Solicitacao ja foi ${usageRequest.status}. Nao e possivel confirmar.`,
      );
    }

    // Atualizar status para CONFIRMADO
    usageRequest.status = UsageStatus.CONFIRMED;
    usageRequest.confirmedAt = new Date();
    usageRequest.confirmedBy = confirmedBy;

    await this.usageRequestRepository.save(usageRequest);

    // AGORA sim creditar pontos ao associado
    let pointsCredited = 0;
    if (usageRequest.pointsToCredit > 0) {
      await this.pointsService.addPoints(
        usageRequest.userId,
        usageRequest.pointsToCredit,
        usageRequest.partnerId,
        `Pontos ganhos (confirmado): ${usageRequest.benefit?.title || 'Beneficio'} - Codigo: ${usageRequest.usageCode}`,
      );
      pointsCredited = usageRequest.pointsToCredit;
    }

    return {
      usageRequest,
      pointsCredited,
      message: `Utilizacao confirmada com sucesso! ${pointsCredited} pontos creditados ao associado.`,
    };
  }

  /**
   * Cancelar uma solicitacao de utilizacao
   */
  async cancelUsage(requestId: string): Promise<UsageRequest> {
    const usageRequest = await this.usageRequestRepository.findOne({
      where: { id: requestId },
    });

    if (!usageRequest) {
      throw new NotFoundException('Solicitacao de utilizacao nao encontrada.');
    }

    if (usageRequest.status !== UsageStatus.PENDING) {
      throw new BadRequestException(
        `Solicitacao ja foi ${usageRequest.status}. Nao e possivel cancelar.`,
      );
    }

    usageRequest.status = UsageStatus.CANCELLED;
    await this.usageRequestRepository.save(usageRequest);

    // Decrementar current_uses pois o uso foi cancelado
    await this.benefitRepository.decrement({ id: usageRequest.benefitId }, 'currentUses', 1);

    return usageRequest;
  }

  /**
   * Listar utilizacoes de um parceiro (para painel do parceiro)
   */
  async getPartnerUsages(partnerId: string, filters?: UsageFilters): Promise<UsageRequest[]> {
    const query = this.usageRequestRepository
      .createQueryBuilder('ur')
      .leftJoinAndSelect('ur.user', 'user')
      .leftJoinAndSelect('ur.benefit', 'benefit')
      .where('ur.partnerId = :partnerId', { partnerId })
      .orderBy('ur.createdAt', 'DESC');

    if (filters?.status) {
      query.andWhere('ur.status = :status', { status: filters.status });
    }

    if (filters?.startDate) {
      query.andWhere('ur.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('ur.createdAt <= :endDate', { endDate: filters.endDate });
    }

    return query.getMany();
  }

  /**
   * Listar utilizacoes de um usuario (historico do associado)
   */
  async getUserUsages(userId: string): Promise<UsageRequest[]> {
    return this.usageRequestRepository.find({
      where: { userId },
      relations: ['partner', 'benefit'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Buscar uma utilizacao pelo codigo
   */
  async findByCode(usageCode: string): Promise<UsageRequest | null> {
    return this.usageRequestRepository.findOne({
      where: { usageCode },
      relations: ['user', 'partner', 'benefit'],
    });
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
      const userUsageCount = await this.usageRequestRepository.count({
        where: { userId, benefitId: benefit.id, status: UsageStatus.CONFIRMED },
      });
      if (userUsageCount >= benefit.maxUsesPerUser) {
        throw new BadRequestException(
          'Voce ja atingiu o limite de utilizacoes deste beneficio.',
        );
      }
    }
  }
}
