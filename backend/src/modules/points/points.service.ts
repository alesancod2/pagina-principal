import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThan } from 'typeorm';
import { UserPoints } from './entities/user-points.entity';
import { PointTransaction, PointTransactionType } from './entities/point-transaction.entity';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface WalletInfo {
  balance: number;
  totalEarned: number;
  totalRedeemed: number;
  totalExpired: number;
}

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(UserPoints)
    private readonly userPointsRepository: Repository<UserPoints>,
    @InjectRepository(PointTransaction)
    private readonly transactionRepository: Repository<PointTransaction>,
  ) {}

  /**
   * Obter carteira/saldo de pontos do usuario
   */
  async getWallet(userId: string): Promise<WalletInfo> {
    let userPoints = await this.userPointsRepository.findOne({
      where: { userId },
    });

    if (!userPoints) {
      // Criar registro se nao existir
      userPoints = this.userPointsRepository.create({
        userId,
        balance: 0,
        totalEarned: 0,
        totalRedeemed: 0,
        totalExpired: 0,
      });
      userPoints = await this.userPointsRepository.save(userPoints);
    }

    return {
      balance: userPoints.balance,
      totalEarned: userPoints.totalEarned,
      totalRedeemed: userPoints.totalRedeemed,
      totalExpired: userPoints.totalExpired,
    };
  }

  /**
   * Obter historico de transacoes de pontos com paginacao
   */
  async getHistory(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResult<PointTransaction>> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.transactionRepository.findAndCount({
      where: { userId },
      relations: ['partner'],
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
   * Adicionar pontos ao usuario (ganho via uso de beneficio)
   */
  async addPoints(
    userId: string,
    amount: number,
    partnerId: string | null,
    description: string,
  ): Promise<PointTransaction> {
    if (amount <= 0) {
      throw new BadRequestException('A quantidade de pontos deve ser positiva.');
    }

    const queryRunner = this.userPointsRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Buscar ou criar registro user_points
      let userPoints = await queryRunner.manager.findOne(UserPoints, {
        where: { userId },
      });

      if (!userPoints) {
        userPoints = queryRunner.manager.create(UserPoints, {
          userId,
          balance: 0,
          totalEarned: 0,
          totalRedeemed: 0,
          totalExpired: 0,
        });
        userPoints = await queryRunner.manager.save(UserPoints, userPoints);
      }

      // Atualizar saldo
      const newBalance = userPoints.balance + amount;
      await queryRunner.manager.update(UserPoints, { userId }, {
        balance: newBalance,
        totalEarned: userPoints.totalEarned + amount,
      });

      // Criar transacao
      const transaction = queryRunner.manager.create(PointTransaction, {
        userId,
        partnerId,
        type: PointTransactionType.EARNED,
        amount,
        balanceAfter: newBalance,
        description,
        expiresAt: this.getExpirationDate(),
      });

      const savedTransaction = await queryRunner.manager.save(PointTransaction, transaction);
      await queryRunner.commitTransaction();

      return savedTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Resgatar/gastar pontos
   */
  async redeemPoints(
    userId: string,
    amount: number,
    description?: string,
  ): Promise<PointTransaction> {
    if (amount <= 0) {
      throw new BadRequestException('A quantidade de pontos deve ser positiva.');
    }

    const queryRunner = this.userPointsRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userPoints = await queryRunner.manager.findOne(UserPoints, {
        where: { userId },
      });

      if (!userPoints) {
        throw new BadRequestException('Voce ainda nao possui pontos.');
      }

      if (userPoints.balance < amount) {
        throw new BadRequestException(
          `Saldo insuficiente. Voce possui ${userPoints.balance} pontos.`,
        );
      }

      // Atualizar saldo
      const newBalance = userPoints.balance - amount;
      await queryRunner.manager.update(UserPoints, { userId }, {
        balance: newBalance,
        totalRedeemed: userPoints.totalRedeemed + amount,
      });

      // Criar transacao
      const transaction = queryRunner.manager.create(PointTransaction, {
        userId,
        partnerId: null,
        type: PointTransactionType.REDEEMED,
        amount: -amount,
        balanceAfter: newBalance,
        description: description || 'Resgate de pontos',
      });

      const savedTransaction = await queryRunner.manager.save(PointTransaction, transaction);
      await queryRunner.commitTransaction();

      return savedTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Obter pontos prestes a expirar (proximos 30 dias)
   */
  async getExpiring(userId: string): Promise<{
    expiringPoints: number;
    expiringDate: Date;
    transactions: PointTransaction[];
  }> {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const expiringTransactions = await this.transactionRepository.find({
      where: {
        userId,
        type: PointTransactionType.EARNED,
        expiresAt: LessThanOrEqual(thirtyDaysFromNow),
      },
      order: { expiresAt: 'ASC' },
    });

    // Filtrar apenas transacoes que ainda nao expiraram
    const validTransactions = expiringTransactions.filter(
      (t) => t.expiresAt && new Date(t.expiresAt) > now,
    );

    const expiringPoints = validTransactions.reduce((sum, t) => sum + t.amount, 0);
    const earliestExpiry = validTransactions.length > 0
      ? new Date(validTransactions[0].expiresAt)
      : thirtyDaysFromNow;

    return {
      expiringPoints: Math.max(0, expiringPoints),
      expiringDate: earliestExpiry,
      transactions: validTransactions,
    };
  }

  /**
   * Data de expiracao padrao: 12 meses a partir de agora
   */
  private getExpirationDate(): Date {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date;
  }
}
