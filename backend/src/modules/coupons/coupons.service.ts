import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon, CouponStatus } from './entities/coupon.entity';
import { Benefit } from '../benefits/entities/benefit.entity';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(Benefit)
    private readonly benefitRepository: Repository<Benefit>,
  ) {}

  /**
   * Listar cupons do usuario
   */
  async getMyCoupons(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResult<Coupon>> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.couponRepository.findAndCount({
      where: { userId },
      relations: ['partner', 'benefit'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Gerar um cupom para o usuario
   */
  async generateCoupon(
    userId: string,
    benefitId: string,
    partnerId: string,
  ): Promise<Coupon> {
    // Validar beneficio
    const benefit = await this.benefitRepository.findOne({
      where: { id: benefitId, partnerId },
    });

    if (!benefit) {
      throw new NotFoundException('Beneficio nao encontrado para este parceiro.');
    }

    if (!benefit.isActive) {
      throw new BadRequestException('Este beneficio nao esta mais ativo.');
    }

    // Validar datas
    const today = new Date();
    if (benefit.startDate && new Date(benefit.startDate) > today) {
      throw new BadRequestException('Este beneficio ainda nao esta disponivel.');
    }
    if (benefit.endDate && new Date(benefit.endDate) < today) {
      throw new BadRequestException('Este beneficio ja expirou.');
    }

    // Validar max_uses total
    if (benefit.maxUses && benefit.currentUses >= benefit.maxUses) {
      throw new BadRequestException('Este beneficio atingiu o limite maximo de utilizacoes.');
    }

    // Validar se ja tem cupom ativo para este beneficio
    const existingCoupon = await this.couponRepository.findOne({
      where: {
        userId,
        benefitId,
        status: CouponStatus.ACTIVE,
      },
    });

    if (existingCoupon) {
      throw new BadRequestException(
        'Voce ja possui um cupom ativo para este beneficio.',
      );
    }

    // Gerar codigo unico
    const code = await this.generateUniqueCode();

    // Definir expiracao (7 dias por padrao)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Criar cupom
    const coupon = this.couponRepository.create({
      userId,
      partnerId,
      benefitId,
      code,
      status: CouponStatus.ACTIVE,
      discountPercent: benefit.discountPercent || null,
      discountFixed: benefit.discountFixed || null,
      expiresAt,
    });

    return this.couponRepository.save(coupon);
  }

  /**
   * Validar cupom pelo codigo (verificar se e valido)
   */
  async validateCoupon(code: string): Promise<{
    valid: boolean;
    coupon?: Coupon;
    reason?: string;
  }> {
    const coupon = await this.couponRepository.findOne({
      where: { code: code.toUpperCase() },
      relations: ['partner', 'benefit', 'user'],
    });

    if (!coupon) {
      return { valid: false, reason: 'Cupom nao encontrado.' };
    }

    if (coupon.status === CouponStatus.USED) {
      return { valid: false, reason: 'Cupom ja foi utilizado.', coupon };
    }

    if (coupon.status === CouponStatus.EXPIRED) {
      return { valid: false, reason: 'Cupom expirado.', coupon };
    }

    if (coupon.status === CouponStatus.CANCELLED) {
      return { valid: false, reason: 'Cupom cancelado.', coupon };
    }

    // Verificar expiracao por data
    if (new Date(coupon.expiresAt) < new Date()) {
      // Atualizar status para expirado
      await this.couponRepository.update(coupon.id, { status: CouponStatus.EXPIRED });
      return { valid: false, reason: 'Cupom expirado.', coupon };
    }

    return { valid: true, coupon };
  }

  /**
   * Usar/consumir um cupom
   */
  async useCoupon(id: string, userId: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({
      where: { id },
      relations: ['partner', 'benefit'],
    });

    if (!coupon) {
      throw new NotFoundException('Cupom nao encontrado.');
    }

    if (coupon.userId !== userId) {
      throw new BadRequestException('Este cupom nao pertence a voce.');
    }

    if (coupon.status !== CouponStatus.ACTIVE) {
      throw new BadRequestException(`Cupom nao pode ser usado. Status: ${coupon.status}`);
    }

    if (new Date(coupon.expiresAt) < new Date()) {
      await this.couponRepository.update(coupon.id, { status: CouponStatus.EXPIRED });
      throw new BadRequestException('Cupom expirado.');
    }

    // Marcar como usado
    coupon.status = CouponStatus.USED;
    coupon.usedAt = new Date();
    coupon.validatedBy = userId;

    return this.couponRepository.save(coupon);
  }

  /**
   * Gerar codigo unico para o cupom
   * Formato: AV-XXXX-XXXX (alfanumerico maiusculo)
   */
  private async generateUniqueCode(): Promise<string> {
    let code: string;
    let exists = true;
    let attempts = 0;
    const maxAttempts = 10;

    while (exists && attempts < maxAttempts) {
      code = this.generateCode();
      const existing = await this.couponRepository.findOne({ where: { code } });
      exists = !!existing;
      attempts++;
    }

    if (exists) {
      throw new BadRequestException('Erro ao gerar codigo do cupom. Tente novamente.');
    }

    return code!;
  }

  /**
   * Gerar codigo no formato AV-XXXX-XXXX
   */
  private generateCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segment1 = Array.from({ length: 4 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length)),
    ).join('');
    const segment2 = Array.from({ length: 4 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length)),
    ).join('');

    return `AV-${segment1}-${segment2}`;
  }
}
