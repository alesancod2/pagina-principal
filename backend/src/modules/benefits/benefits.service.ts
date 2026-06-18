import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Benefit, BenefitType } from './entities/benefit.entity';
import { BenefitUsage } from './entities/benefit-usage.entity';
import { CreateBenefitDto, UpdateBenefitDto } from './dto/create-benefit.dto';
import { UseBenefitDto } from './dto/use-benefit.dto';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class BenefitsService {
  constructor(
    @InjectRepository(Benefit)
    private readonly benefitRepository: Repository<Benefit>,
    @InjectRepository(BenefitUsage)
    private readonly usageRepository: Repository<BenefitUsage>,
  ) {}

  /**
   * Listar todos os beneficios ativos (com filtro por parceiro opcional)
   */
  async findAll(partnerId?: string, page: number = 1, limit: number = 20): Promise<PaginatedResult<Benefit>> {
    const query = this.benefitRepository.createQueryBuilder('benefit')
      .leftJoinAndSelect('benefit.partner', 'partner')
      .where('benefit.isActive = :isActive', { isActive: true });

    if (partnerId) {
      query.andWhere('benefit.partnerId = :partnerId', { partnerId });
    }

    // Filtrar por data valida
    const now = new Date().toISOString().split('T')[0];
    query.andWhere(
      '(benefit.start_date IS NULL OR benefit.start_date <= :now)',
      { now },
    );
    query.andWhere(
      '(benefit.end_date IS NULL OR benefit.end_date >= :now)',
      { now },
    );

    query.orderBy('benefit.createdAt', 'DESC');

    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Buscar beneficio por ID
   */
  async findById(id: string): Promise<Benefit> {
    const benefit = await this.benefitRepository.findOne({
      where: { id },
      relations: ['partner'],
    });

    if (!benefit) {
      throw new NotFoundException(`Beneficio com ID "${id}" nao encontrado`);
    }

    return benefit;
  }

  /**
   * Criar novo beneficio (admin/manager)
   */
  async create(dto: CreateBenefitDto): Promise<Benefit> {
    const benefit = this.benefitRepository.create(dto);
    return this.benefitRepository.save(benefit);
  }

  /**
   * Atualizar beneficio existente (admin/manager)
   */
  async update(id: string, dto: UpdateBenefitDto): Promise<Benefit> {
    const benefit = await this.findById(id);
    Object.assign(benefit, dto);
    return this.benefitRepository.save(benefit);
  }

  /**
   * Utilizar um beneficio (associado)
   *
   * REGRA DE NEGOCIO: A utilizacao de beneficio NAO exige pontos.
   * Pontos sao apenas CREDITADOS (acumulados) ao associado apos o uso.
   * O campo pointsRequired NAO e verificado aqui - pertence ao fluxo
   * separado de RESGATE de pontos (POST /points/redeem).
   *
   * Validacoes: ativo, dentro das datas, max usos, dia da semana
   * Resultado: registra uso + CREDITA pontos (pointsGenerated)
   */
  async useBenefit(userId: string, dto: UseBenefitDto): Promise<BenefitUsage> {
    const benefit = await this.findById(dto.benefitId);

    // IMPORTANTE: NAO verificar saldo de pontos do usuario.
    // A utilizacao de beneficio e LIVRE - pontos sao apenas GANHOS, nunca exigidos.

    // 1. Validar se o beneficio esta ativo
    if (!benefit.isActive) {
      throw new BadRequestException('Este beneficio nao esta mais ativo.');
    }

    // 2. Validar datas
    const today = new Date();
    if (benefit.startDate && new Date(benefit.startDate) > today) {
      throw new BadRequestException('Este beneficio ainda nao esta disponivel.');
    }
    if (benefit.endDate && new Date(benefit.endDate) < today) {
      throw new BadRequestException('Este beneficio ja expirou.');
    }

    // 3. Validar dia da semana (1=domingo, 7=sabado em JS -> converter)
    const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay(); // 1-7 (seg-dom)
    const availableDays = benefit.daysAvailable.split(',').map(Number);
    if (!availableDays.includes(dayOfWeek)) {
      throw new BadRequestException('Beneficio nao disponivel hoje.');
    }

    // 4. Validar max_uses total
    if (benefit.maxUses && benefit.currentUses >= benefit.maxUses) {
      throw new BadRequestException('Este beneficio atingiu o limite maximo de utilizacoes.');
    }

    // 5. Validar max_uses_per_user
    if (benefit.maxUsesPerUser) {
      const userUsageCount = await this.usageRepository.count({
        where: { userId, benefitId: benefit.id },
      });
      if (userUsageCount >= benefit.maxUsesPerUser) {
        throw new BadRequestException('Voce ja atingiu o limite de utilizacoes deste beneficio.');
      }
    }

    // 6. Calcular desconto aplicado
    let discountApplied = 0;
    if (dto.amount) {
      switch (benefit.benefitType) {
        case BenefitType.DISCOUNT_PERCENT:
          discountApplied = (dto.amount * (benefit.discountPercent || 0)) / 100;
          break;
        case BenefitType.DISCOUNT_FIXED:
          discountApplied = benefit.discountFixed || 0;
          break;
        case BenefitType.CASHBACK:
          discountApplied = (dto.amount * (benefit.cashbackPercent || 0)) / 100;
          break;
        default:
          discountApplied = 0;
      }
    }

    // 7. Calcular pontos gerados
    const pointsEarned = benefit.pointsGenerated || 0;

    // 8. Registrar uso na tabela benefit_usages
    const usage = this.usageRepository.create({
      userId,
      partnerId: dto.partnerId,
      benefitId: benefit.id,
      amount: dto.amount || null,
      discountApplied,
      pointsEarned,
      notes: dto.notes || null,
      usedAt: new Date(),
    });

    const savedUsage = await this.usageRepository.save(usage);

    // 9. Incrementar current_uses no beneficio
    await this.benefitRepository.increment({ id: benefit.id }, 'currentUses', 1);

    // 10. Registrar transacao de pontos - CREDITAR pontos ao associado (se gerar pontos)
    // Pontos sao ACUMULADOS a cada uso de beneficio (nunca debitados neste fluxo)
    if (pointsEarned > 0) {
      await this.registerPointTransaction(userId, dto.partnerId, pointsEarned, benefit.title);
    }

    return savedUsage;
  }

  /**
   * Registrar transacao de pontos na tabela point_transactions
   * e atualizar saldo em user_points
   */
  private async registerPointTransaction(
    userId: string,
    partnerId: string,
    amount: number,
    description: string,
  ): Promise<void> {
    const queryRunner = this.benefitRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Buscar ou criar registro user_points
      let userPoints = await queryRunner.query(
        `SELECT * FROM user_points WHERE user_id = $1`,
        [userId],
      );

      let balanceAfter: number;

      if (userPoints.length === 0) {
        // Criar registro de pontos para o usuario
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

      // Registrar transacao
      await queryRunner.query(
        `INSERT INTO point_transactions (user_id, partner_id, type, amount, balance_after, description) VALUES ($1, $2, 'earned', $3, $4, $5)`,
        [userId, partnerId, amount, balanceAfter, `Pontos ganhos: ${description}`],
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Historico de usos de um usuario
   */
  async getUserUsageHistory(userId: string, page: number = 1, limit: number = 20): Promise<PaginatedResult<BenefitUsage>> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.usageRepository.findAndCount({
      where: { userId },
      relations: ['benefit', 'partner'],
      order: { usedAt: 'DESC' },
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
}
