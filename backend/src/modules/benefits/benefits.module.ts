import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BenefitsController } from './benefits.controller';
import { BenefitsService } from './benefits.service';
import { UseBenefitFlowService } from './use-benefit-flow.service';
import { Benefit } from './entities/benefit.entity';
import { BenefitUsage } from './entities/benefit-usage.entity';
import { Association } from '../users/entities/association.entity';
import { AssociationGuard } from '../aeasy/aeasy.guard';
import { CouponsModule } from '../coupons/coupons.module';
import { PointsModule } from '../points/points.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Benefit, BenefitUsage, Association]),
    CouponsModule,
    PointsModule,
  ],
  controllers: [BenefitsController],
  providers: [BenefitsService, UseBenefitFlowService, AssociationGuard],
  exports: [BenefitsService, UseBenefitFlowService],
})
export class BenefitsModule {}
