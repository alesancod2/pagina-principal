import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { GenerateCouponDto } from './dto/generate-coupon.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('coupons')
@UseGuards(JwtAuthGuard)
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  /**
   * GET /coupons
   * Listar meus cupons
   */
  @Get()
  async getMyCoupons(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.couponsService.getMyCoupons(
      userId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  /**
   * GET /coupons/:code
   * Validar cupom pelo codigo
   */
  @Get(':code')
  async validateCoupon(@Param('code') code: string) {
    return this.couponsService.validateCoupon(code);
  }

  /**
   * POST /coupons/generate
   * Gerar novo cupom
   */
  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  async generateCoupon(
    @CurrentUser('id') userId: string,
    @Body() dto: GenerateCouponDto,
  ) {
    return this.couponsService.generateCoupon(
      userId,
      dto.benefitId,
      dto.partnerId,
    );
  }

  /**
   * POST /coupons/:id/use
   * Usar/consumir um cupom
   */
  @Post(':id/use')
  @HttpCode(HttpStatus.OK)
  async useCoupon(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.couponsService.useCoupon(id, userId);
  }
}
