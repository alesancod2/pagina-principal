import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsageSession } from './entities/usage-session.entity';
import { Partner } from '../partners/entities/partner.entity';
import { Benefit } from '../benefits/entities/benefit.entity';
import { QrCodeService } from './qrcode.service';
import { QrCodeController } from './qrcode.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UsageSession, Partner, Benefit])],
  controllers: [QrCodeController],
  providers: [QrCodeService],
  exports: [QrCodeService],
})
export class QrCodeModule {}
