import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BenefitsController } from './benefits.controller';
import { BenefitsService } from './benefits.service';
import { Benefit } from './entities/benefit.entity';
import { BenefitUsage } from './entities/benefit-usage.entity';
import { Association } from '../users/entities/association.entity';
import { AssociationGuard } from '../aeasy/aeasy.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Benefit, BenefitUsage, Association]),
  ],
  controllers: [BenefitsController],
  providers: [BenefitsService, AssociationGuard],
  exports: [BenefitsService],
})
export class BenefitsModule {}
