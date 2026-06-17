import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Partner } from '../partners/entities/partner.entity';
import { User } from '../users/entities/user.entity';
import { Benefit } from '../benefits/entities/benefit.entity';
import { BenefitUsage } from '../benefits/entities/benefit-usage.entity';
import { Coupon } from '../coupons/entities/coupon.entity';
import { PointTransaction } from '../points/entities/point-transaction.entity';

export interface DashboardStats {
  totalMembers: number;
  totalPartners: number;
  totalBenefitsUsed: number;
  totalPointsDistributed: number;
  totalCouponsGenerated: number;
  activeBenefits: number;
  activePartners: number;
  newMembersThisMonth: number;
}

export interface MonthlyStats {
  month: string;
  benefitsUsed: number;
  pointsDistributed: number;
  couponsGenerated: number;
  newMembers: number;
}

export interface UsageReport {
  data: any[];
  total: number;
  period: { start: string; end: string };
}

export interface PointsReport {
  totalEarned: number;
  totalRedeemed: number;
  totalExpired: number;
  averagePerUser: number;
  topEarners: { userId: string; name: string; total: number }[];
}

export interface PartnerRanking {
  partnerId: string;
  companyName: string;
  tradeName: string;
  totalUsages: number;
  totalPointsGenerated: number;
  totalCoupons: number;
  rating: number;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Partner)
    private readonly partnerRepository: Repository<Partner>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Benefit)
    private readonly benefitRepository: Repository<Benefit>,
    @InjectRepository(BenefitUsage)
    private readonly usageRepository: Repository<BenefitUsage>,
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(PointTransaction)
    private readonly transactionRepository: Repository<PointTransaction>,
  ) {}

  /**
   * Obter estatisticas gerais do dashboard
   */
  async getStats(): Promise<DashboardStats> {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalMembers,
      totalPartners,
      totalBenefitsUsed,
      totalCouponsGenerated,
      activeBenefits,
      activePartners,
    ] = await Promise.all([
      this.userRepository.count({ where: { role: 'member' } }),
      this.partnerRepository.count(),
      this.usageRepository.count(),
      this.couponRepository.count(),
      this.benefitRepository.count({ where: { isActive: true } }),
      this.partnerRepository.count({ where: { status: 'active' as any } }),
    ]);

    // Pontos totais distribuidos
    const pointsResult = await this.transactionRepository
      .createQueryBuilder('t')
      .select('COALESCE(SUM(t.amount), 0)', 'total')
      .where('t.type = :type', { type: 'earned' })
      .getRawOne();

    const totalPointsDistributed = parseInt(pointsResult?.total || '0', 10);

    // Novos membros este mes
    const newMembersThisMonth = await this.userRepository
      .createQueryBuilder('u')
      .where('u.role = :role', { role: 'member' })
      .andWhere('u.created_at >= :firstDay', { firstDay: firstDayOfMonth })
      .getCount();

    return {
      totalMembers,
      totalPartners,
      totalBenefitsUsed,
      totalPointsDistributed,
      totalCouponsGenerated,
      activeBenefits,
      activePartners,
      newMembersThisMonth,
    };
  }

  /**
   * Obter estatisticas mensais (ultimos 12 meses)
   */
  async getMonthlyStats(): Promise<MonthlyStats[]> {
    const months: MonthlyStats[] = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      const monthLabel = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      const [benefitsUsed, couponsGenerated, newMembers] = await Promise.all([
        this.usageRepository
          .createQueryBuilder('u')
          .where('u.used_at BETWEEN :start AND :end', {
            start: startOfMonth,
            end: endOfMonth,
          })
          .getCount(),
        this.couponRepository
          .createQueryBuilder('c')
          .where('c.created_at BETWEEN :start AND :end', {
            start: startOfMonth,
            end: endOfMonth,
          })
          .getCount(),
        this.userRepository
          .createQueryBuilder('u')
          .where('u.role = :role', { role: 'member' })
          .andWhere('u.created_at BETWEEN :start AND :end', {
            start: startOfMonth,
            end: endOfMonth,
          })
          .getCount(),
      ]);

      // Pontos distribuidos no mes
      const pointsResult = await this.transactionRepository
        .createQueryBuilder('t')
        .select('COALESCE(SUM(t.amount), 0)', 'total')
        .where('t.type = :type', { type: 'earned' })
        .andWhere('t.created_at BETWEEN :start AND :end', {
          start: startOfMonth,
          end: endOfMonth,
        })
        .getRawOne();

      months.push({
        month: monthLabel,
        benefitsUsed,
        pointsDistributed: parseInt(pointsResult?.total || '0', 10),
        couponsGenerated,
        newMembers,
      });
    }

    return months;
  }

  /**
   * Relatorio de uso com filtros de data
   */
  async getUsageReport(startDate?: string, endDate?: string): Promise<UsageReport> {
    const query = this.usageRepository
      .createQueryBuilder('usage')
      .leftJoinAndSelect('usage.benefit', 'benefit')
      .leftJoinAndSelect('usage.partner', 'partner')
      .leftJoinAndSelect('usage.user', 'user')
      .orderBy('usage.usedAt', 'DESC');

    if (startDate) {
      query.andWhere('usage.used_at >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('usage.used_at <= :endDate', { endDate });
    }

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      period: {
        start: startDate || 'all',
        end: endDate || 'all',
      },
    };
  }

  /**
   * Relatorio de pontos
   */
  async getPointsReport(): Promise<PointsReport> {
    // Totais
    const earnedResult = await this.transactionRepository
      .createQueryBuilder('t')
      .select('COALESCE(SUM(t.amount), 0)', 'total')
      .where('t.type = :type', { type: 'earned' })
      .getRawOne();

    const redeemedResult = await this.transactionRepository
      .createQueryBuilder('t')
      .select('COALESCE(SUM(ABS(t.amount)), 0)', 'total')
      .where('t.type = :type', { type: 'redeemed' })
      .getRawOne();

    const expiredResult = await this.transactionRepository
      .createQueryBuilder('t')
      .select('COALESCE(SUM(ABS(t.amount)), 0)', 'total')
      .where('t.type = :type', { type: 'expired' })
      .getRawOne();

    const totalEarned = parseInt(earnedResult?.total || '0', 10);
    const totalRedeemed = parseInt(redeemedResult?.total || '0', 10);
    const totalExpired = parseInt(expiredResult?.total || '0', 10);

    // Media por usuario
    const memberCount = await this.userRepository.count({ where: { role: 'member' } });
    const averagePerUser = memberCount > 0 ? Math.round(totalEarned / memberCount) : 0;

    // Top earners
    const topEarners = await this.transactionRepository
      .createQueryBuilder('t')
      .select('t.user_id', 'userId')
      .addSelect('u.name', 'name')
      .addSelect('COALESCE(SUM(t.amount), 0)', 'total')
      .leftJoin('users', 'u', 'u.id = t.user_id')
      .where('t.type = :type', { type: 'earned' })
      .groupBy('t.user_id')
      .addGroupBy('u.name')
      .orderBy('total', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      totalEarned,
      totalRedeemed,
      totalExpired,
      averagePerUser,
      topEarners: topEarners.map((r: any) => ({
        userId: r.userId,
        name: r.name || 'Usuario',
        total: parseInt(r.total, 10),
      })),
    };
  }

  /**
   * Ranking de parceiros por uso
   */
  async getPartnersRanking(): Promise<PartnerRanking[]> {
    const ranking = await this.partnerRepository
      .createQueryBuilder('p')
      .select('p.id', 'partnerId')
      .addSelect('p.company_name', 'companyName')
      .addSelect('p.trade_name', 'tradeName')
      .addSelect('p.rating', 'rating')
      .addSelect(
        `(SELECT COUNT(*) FROM benefit_usages bu WHERE bu.partner_id = p.id)`,
        'totalUsages',
      )
      .addSelect(
        `(SELECT COALESCE(SUM(bu.points_earned), 0) FROM benefit_usages bu WHERE bu.partner_id = p.id)`,
        'totalPointsGenerated',
      )
      .addSelect(
        `(SELECT COUNT(*) FROM coupons c WHERE c.partner_id = p.id)`,
        'totalCoupons',
      )
      .orderBy('"totalUsages"', 'DESC')
      .limit(20)
      .getRawMany();

    return ranking.map((r: any) => ({
      partnerId: r.partnerId,
      companyName: r.companyName,
      tradeName: r.tradeName,
      totalUsages: parseInt(r.totalUsages || '0', 10),
      totalPointsGenerated: parseInt(r.totalPointsGenerated || '0', 10),
      totalCoupons: parseInt(r.totalCoupons || '0', 10),
      rating: parseFloat(r.rating || '0'),
    }));
  }

  /**
   * Listar todos os membros com informacoes da associacao
   */
  async getMembers(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.userRepository.findAndCount({
      where: { role: 'member' },
      relations: ['association'],
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
}
