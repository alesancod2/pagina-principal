import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PointsService } from './points.service';
import { RedeemPointsDto } from './dto/redeem-points.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('points')
@UseGuards(JwtAuthGuard)
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  /**
   * GET /points/wallet
   * Retorna saldo e totais de pontos do usuario
   */
  @Get('wallet')
  async getWallet(@CurrentUser('id') userId: string) {
    return this.pointsService.getWallet(userId);
  }

  /**
   * GET /points/history?page=1&limit=20
   * Retorna historico de transacoes de pontos
   */
  @Get('history')
  async getHistory(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.pointsService.getHistory(
      userId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  /**
   * POST /points/redeem
   * Resgata pontos do usuario
   */
  @Post('redeem')
  @HttpCode(HttpStatus.OK)
  async redeemPoints(
    @CurrentUser('id') userId: string,
    @Body() dto: RedeemPointsDto,
  ) {
    return this.pointsService.redeemPoints(
      userId,
      dto.amount,
      dto.description,
    );
  }

  /**
   * GET /points/expiring
   * Retorna pontos prestes a expirar (proximos 30 dias)
   */
  @Get('expiring')
  async getExpiring(@CurrentUser('id') userId: string) {
    return this.pointsService.getExpiring(userId);
  }
}
