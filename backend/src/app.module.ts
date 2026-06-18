import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { AEasyModule } from './modules/aeasy/aeasy.module';
import { PartnersModule } from './modules/partners/partners.module';
import { BenefitsModule } from './modules/benefits/benefits.module';
import { PointsModule } from './modules/points/points.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { AdminModule } from './modules/admin/admin.module';
import { VouchersModule } from './modules/vouchers/vouchers.module';
import { QrCodeModule } from './modules/qrcode/qrcode.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: false,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }),
    AuthModule,
    AEasyModule,
    PartnersModule,
    BenefitsModule,
    PointsModule,
    CouponsModule,
    CampaignsModule,
    AdminModule,
    VouchersModule,
    QrCodeModule,
  ],
})
export class AppModule {}
