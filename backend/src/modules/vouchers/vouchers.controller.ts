import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { CreateVoucherDto, UpdateVoucherDto } from './dto/create-voucher.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  /**
   * GET /vouchers - Listar todos os vouchers ativos (público)
   */
  @Get()
  async findAll() {
    return this.vouchersService.findAll();
  }

  /**
   * GET /vouchers/partner/:partnerId - Vouchers de um parceiro
   */
  @Get('partner/:partnerId')
  async findByPartner(@Param('partnerId', ParseUUIDPipe) partnerId: string) {
    return this.vouchersService.findAll(partnerId);
  }

  /**
   * GET /vouchers/my-usages - Histórico de uso do usuário logado
   */
  @Get('my-usages')
  @UseGuards(JwtAuthGuard)
  async getMyUsages(@CurrentUser('id') userId: string) {
    return this.vouchersService.getUserUsages(userId);
  }

  /**
   * GET /vouchers/partner-stats/:partnerId - Estatísticas de vouchers do parceiro
   */
  @Get('partner-stats/:partnerId')
  @UseGuards(JwtAuthGuard)
  async getPartnerStats(@Param('partnerId', ParseUUIDPipe) partnerId: string) {
    return this.vouchersService.getPartnerVoucherStats(partnerId);
  }

  /**
   * GET /vouchers/:code - Validar/buscar voucher por código
   */
  @Get(':code')
  async findByCode(@Param('code') code: string) {
    return this.vouchersService.findByCode(code);
  }

  /**
   * POST /vouchers - Criar voucher (admin)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createVoucherDto: CreateVoucherDto) {
    return this.vouchersService.create(createVoucherDto);
  }

  /**
   * PUT /vouchers/:id - Atualizar voucher (admin)
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVoucherDto: UpdateVoucherDto,
  ) {
    return this.vouchersService.update(id, updateVoucherDto);
  }

  /**
   * POST /vouchers/:code/use - Utilizar voucher (requer autenticação)
   */
  @Post(':code/use')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async useVoucher(
    @Param('code') code: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.vouchersService.useVoucher(userId, code);
  }

  /**
   * POST /vouchers/usages/:id/confirm - Parceiro confirma utilização
   * Requer autenticação + role de parceiro
   */
  @Post('usages/:id/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager', 'partner')
  @HttpCode(HttpStatus.OK)
  async confirmUsage(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') confirmedBy: string,
  ) {
    return this.vouchersService.confirmVoucherUsage(id, confirmedBy);
  }
}
