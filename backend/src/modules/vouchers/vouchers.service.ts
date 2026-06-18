import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Voucher, PeriodControl } from './entities/voucher.entity';
import { VoucherUsage } from './entities/voucher-usage.entity';
import { CreateVoucherDto, UpdateVoucherDto } from './dto/create-voucher.dto';

@Injectable()
export class VouchersService {
  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
    @InjectRepository(VoucherUsage)
    private readonly usageRepository: Repository<VoucherUsage>,
  ) {}

  /**
   * Listar todos os vouchers (filtro por parceiro opcional)
   */
  async findAll(partnerId?: string): Promise<Voucher[]> {
    const query = this.voucherRepository.createQueryBuilder('voucher')
      .leftJoinAndSelect('voucher.partner', 'partner');

    if (partnerId) {
      query.andWhere('voucher.partnerId = :partnerId', { partnerId });
    }

    query.orderBy('voucher.createdAt', 'DESC');

    return query.getMany();
  }

  /**
   * Buscar voucher por código
   */
  async findByCode(code: string): Promise<Voucher> {
    const voucher = await this.voucherRepository.findOne({
      where: { code: code.toUpperCase() },
      relations: ['partner'],
    });

    if (!voucher) {
      throw new NotFoundException(`Voucher com código "${code}" não encontrado.`);
    }

    return voucher;
  }

  /**
   * Criar novo voucher (admin)
   */
  async create(dto: CreateVoucherDto): Promise<Voucher> {
    const voucher = this.voucherRepository.create({
      ...dto,
      code: dto.code.toUpperCase(),
    });
    return this.voucherRepository.save(voucher);
  }

  /**
   * Atualizar voucher (admin)
   */
  async update(id: string, dto: UpdateVoucherDto): Promise<Voucher> {
    const voucher = await this.voucherRepository.findOne({ where: { id } });
    if (!voucher) {
      throw new NotFoundException(`Voucher com ID "${id}" não encontrado.`);
    }
    if (dto.code) {
      dto.code = dto.code.toUpperCase();
    }
    Object.assign(voucher, dto);
    return this.voucherRepository.save(voucher);
  }

  /**
   * MÉTODO PRINCIPAL: Utilizar voucher
   *
   * Fluxo:
   * 1. Encontra voucher pelo código
   * 2. Valida se está ativo e dentro das datas
   * 3. Valida se o parceiro existe
   * 4. Conta utilizações do usuário no período atual (period_control)
   * 5. Se count >= usage_limit: bloqueia
   * 6. Caso contrário: registra utilização
   * 7. NOTA: Pontos NÃO são creditados aqui - somente após confirmação do parceiro
   */
  async useVoucher(userId: string, voucherCode: string): Promise<VoucherUsage> {
    // 1. Encontrar voucher pelo código
    const voucher = await this.findByCode(voucherCode);

    // 2. Validar se está ativo
    if (!voucher.isActive) {
      throw new BadRequestException('Este voucher não está ativo.');
    }

    // 3. Validar datas
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (voucher.startDate && new Date(voucher.startDate) > today) {
      throw new BadRequestException('Este voucher ainda não está disponível.');
    }
    if (voucher.endDate && new Date(voucher.endDate) < today) {
      throw new BadRequestException('Este voucher já expirou.');
    }

    // 4. Validar parceiro
    if (!voucher.partner) {
      throw new BadRequestException('Parceiro vinculado a este voucher não encontrado.');
    }

    // 5. Contar utilizações no período atual
    const usageCount = await this.getUserUsageCount(userId, voucher.id, voucher.periodControl);

    // 6. Verificar limite
    if (usageCount >= voucher.usageLimit) {
      throw new BadRequestException(
        `Você atingiu o limite de utilizações deste benefício para o período atual. (${usageCount}/${voucher.usageLimit} utilizações no período)`,
      );
    }

    // 7. Registrar utilização (pontos NÃO creditados aqui)
    const usage = this.usageRepository.create({
      voucherId: voucher.id,
      partnerId: voucher.partnerId,
      userId,
      usedAt: new Date(),
    });

    return this.usageRepository.save(usage);
  }

  /**
   * Parceiro confirma utilização → CREDITA pontos ao associado
   */
  async confirmVoucherUsage(usageId: string, confirmedBy: string): Promise<VoucherUsage> {
    const usage = await this.usageRepository.findOne({
      where: { id: usageId },
      relations: ['voucher'],
    });

    if (!usage) {
      throw new NotFoundException(`Utilização com ID "${usageId}" não encontrada.`);
    }

    if (usage.confirmedBy) {
      throw new BadRequestException('Esta utilização já foi confirmada.');
    }

    // Marcar como confirmada
    usage.confirmedBy = confirmedBy;
    const savedUsage = await this.usageRepository.save(usage);

    // Creditar pontos ao associado
    const pointsToCredit = usage.voucher?.pointsGenerated || 0;
    if (pointsToCredit > 0) {
      await this.creditPoints(usage.userId, usage.partnerId, pointsToCredit, usage.voucher.title);
    }

    return savedUsage;
  }

  /**
   * Contar utilizações do usuário no período atual
   */
  async getUserUsageCount(userId: string, voucherId: string, periodControl: PeriodControl): Promise<number> {
    const { start, end } = this.getDateRangeForPeriod(periodControl);

    return this.usageRepository.count({
      where: {
        userId,
        voucherId,
        usedAt: Between(start, end),
      },
    });
  }

  /**
   * Histórico de uso do usuário
   */
  async getUserUsages(userId: string): Promise<VoucherUsage[]> {
    return this.usageRepository.find({
      where: { userId },
      relations: ['voucher', 'partner'],
      order: { usedAt: 'DESC' },
    });
  }

  /**
   * Estatísticas de vouchers para o painel do parceiro
   */
  async getPartnerVoucherStats(partnerId: string): Promise<{
    totalVouchers: number;
    activeVouchers: number;
    totalUsages: number;
    pendingConfirmation: number;
    confirmedUsages: number;
  }> {
    const totalVouchers = await this.voucherRepository.count({ where: { partnerId } });
    const activeVouchers = await this.voucherRepository.count({ where: { partnerId, isActive: true } });
    const totalUsages = await this.usageRepository.count({ where: { partnerId } });

    // Pendentes = sem confirmed_by
    const pendingConfirmation = await this.usageRepository
      .createQueryBuilder('usage')
      .where('usage.partner_id = :partnerId', { partnerId })
      .andWhere('usage.confirmed_by IS NULL')
      .getCount();

    const confirmedUsages = totalUsages - pendingConfirmation;

    return {
      totalVouchers,
      activeVouchers,
      totalUsages,
      pendingConfirmation,
      confirmedUsages,
    };
  }

  /**
   * Lógica de cálculo de intervalo de datas por período
   */
  private getDateRangeForPeriod(period: PeriodControl): { start: Date; end: Date } {
    const now = new Date();

    switch (period) {
      case PeriodControl.DIARIO: {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        return { start, end };
      }

      case PeriodControl.SEMANAL: {
        const dayOfWeek = now.getDay();
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday, 0, 0, 0);
        const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6, 23, 59, 59, 999);
        return { start, end };
      }

      case PeriodControl.MENSAL: {
        const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        return { start, end };
      }

      case PeriodControl.TRIMESTRAL: {
        const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
        const start = new Date(now.getFullYear(), quarterMonth, 1, 0, 0, 0);
        const end = new Date(now.getFullYear(), quarterMonth + 3, 0, 23, 59, 59, 999);
        return { start, end };
      }

      case PeriodControl.ANUAL: {
        const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
        const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        return { start, end };
      }

      case PeriodControl.ILIMITADO:
      default: {
        const start = new Date(2000, 0, 1, 0, 0, 0);
        const end = new Date(2099, 11, 31, 23, 59, 59, 999);
        return { start, end };
      }
    }
  }

  /**
   * Creditar pontos ao usuário após confirmação do parceiro
   */
  private async creditPoints(
    userId: string,
    partnerId: string,
    amount: number,
    description: string,
  ): Promise<void> {
    const queryRunner = this.voucherRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Buscar ou criar registro user_points
      const userPoints = await queryRunner.query(
        `SELECT * FROM user_points WHERE user_id = $1`,
        [userId],
      );

      let balanceAfter: number;

      if (userPoints.length === 0) {
        balanceAfter = amount;
        await queryRunner.query(
          `INSERT INTO user_points (user_id, balance, total_earned) VALUES ($1, $2, $3)`,
          [userId, amount, amount],
        );
      } else {
        balanceAfter = (userPoints[0].balance || 0) + amount;
        await queryRunner.query(
          `UPDATE user_points SET balance = balance + $1, total_earned = total_earned + $1, updated_at = NOW() WHERE user_id = $2`,
          [amount, userId],
        );
      }

      // Registrar transação
      await queryRunner.query(
        `INSERT INTO point_transactions (user_id, partner_id, type, amount, balance_after, description) VALUES ($1, $2, 'earned', $3, $4, $5)`,
        [userId, partnerId, amount, balanceAfter, `Voucher confirmado: ${description}`],
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
