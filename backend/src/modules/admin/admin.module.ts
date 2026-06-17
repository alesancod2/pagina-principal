import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Partner } from '../partners/entities/partner.entity';
import { User } from '../users/entities/user.entity';
import { Benefit } from '../benefits/entities/benefit.entity';
import { BenefitUsage } from '../benefits/entities/benefit-usage.entity';
import { Coupon } from '../coupons/entities/coupon.entity';
import { PointTransaction } from '../points/entities/point-transaction.entity';
import { PartnersService } from '../partners/partners.service';
import { BenefitsService } from '../benefits/benefits.service';
import { CampaignsModule } from '../campaigns/campaigns.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Partner,
      User,
      Benefit,
      BenefitUsage,
      Coupon,
      PointTransaction,
    ]),
    CampaignsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, PartnersService, BenefitsService],
  exports: [AdminService],
})
export class AdminModule {}
