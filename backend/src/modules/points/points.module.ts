import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointsController } from './points.controller';
import { PointsService } from './points.service';
import { UserPoints } from './entities/user-points.entity';
import { PointTransaction } from './entities/point-transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserPoints, PointTransaction]),
  ],
  controllers: [PointsController],
  providers: [PointsService],
  exports: [PointsService],
})
export class PointsModule {}
