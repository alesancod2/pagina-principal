import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BenefitsService } from './benefits.service';
import { UseBenefitFlowService } from './use-benefit-flow.service';
import { CreateBenefitDto, UpdateBenefitDto } from './dto/create-benefit.dto';
import { UseBenefitDto } from './dto/use-benefit.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AssociationGuard } from '../aeasy/aeasy.guard';

@Controller('benefits')
export class BenefitsController {
  constructor(
    private readonly benefitsService: BenefitsService,
    private readonly useBenefitFlowService: UseBenefitFlowService,
  ) {}

  /**
   * GET /benefits - Listar todos os beneficios ativos
   */
  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.benefitsService.findAll(
      undefined,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  /**
   * GET /benefits/partner/:partnerId - Beneficios de um parceiro
   */
  @Get('partner/:partnerId')
  async findByPartner(
    @Param('partnerId', ParseUUIDPipe) partnerId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.benefitsService.findAll(
      partnerId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  /**
   * GET /benefits/my-history - Historico de uso do usuario logado
   */
  @Get('my-history')
  @UseGuards(JwtAuthGuard)
  async getMyHistory(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.benefitsService.getUserUsageHistory(
      userId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  /**
   * GET /benefits/:id - Detalhe de um beneficio
   */
  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.benefitsService.findById(id);
  }

  /**
   * POST /benefits - Criar beneficio (admin/manager)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createBenefitDto: CreateBenefitDto) {
    return this.benefitsService.create(createBenefitDto);
  }

  /**
   * PUT /benefits/:id - Atualizar beneficio (admin/manager)
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBenefitDto: UpdateBenefitDto,
  ) {
    return this.benefitsService.update(id, updateBenefitDto);
  }

  /**
   * POST /benefits/:id/use - Utilizar beneficio (requer associacao ativa)
   * Fluxo completo: valida associacao + beneficio + gera cupom + pontos
   */
  @Post(':id/use')
  @UseGuards(JwtAuthGuard, AssociationGuard)
  @HttpCode(HttpStatus.CREATED)
  async useBenefit(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body() useBenefitDto: UseBenefitDto,
  ) {
    useBenefitDto.benefitId = id;
    return this.useBenefitFlowService.execute(userId, {
      benefitId: id,
      partnerId: useBenefitDto.partnerId,
      amount: useBenefitDto.amount,
      notes: useBenefitDto.notes,
    });
  }
}
