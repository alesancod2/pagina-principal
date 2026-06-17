import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { PartnersService } from '../partners/partners.service';
import { BenefitsService } from '../benefits/benefits.service';
import { CampaignsService } from '../campaigns/campaigns.service';
import { CreatePartnerDto } from '../partners/dto/create-partner.dto';
import { UpdatePartnerDto } from '../partners/dto/update-partner.dto';
import { CreateBenefitDto, UpdateBenefitDto } from '../benefits/dto/create-benefit.dto';
import { CreateCampaignDto, UpdateCampaignDto } from '../campaigns/dto/create-campaign.dto';
import { PartnerStatus } from '../partners/entities/partner.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'manager')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly partnersService: PartnersService,
    private readonly benefitsService: BenefitsService,
    private readonly campaignsService: CampaignsService,
  ) {}

  // ===================== DASHBOARD / STATS =====================

  /**
   * GET /admin/stats - Indicadores gerais do dashboard
   */
  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  /**
   * GET /admin/stats/monthly - Estatisticas mensais (ultimos 12 meses)
   */
  @Get('stats/monthly')
  async getMonthlyStats() {
    return this.adminService.getMonthlyStats();
  }

  // ===================== PARTNERS =====================

  /**
   * GET /admin/partners - Listar parceiros com dados admin
   */
  @Get('partners')
  async getPartners(
    @Query('category') category?: string,
    @Query('city') city?: string,
    @Query('status') status?: PartnerStatus,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string,
  ) {
    return this.partnersService.findAll({
      category,
      city,
      status,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      sort: sort || 'createdAt:DESC',
    });
  }

  /**
   * POST /admin/partners - Criar parceiro
   */
  @Post('partners')
  @HttpCode(HttpStatus.CREATED)
  async createPartner(@Body() dto: CreatePartnerDto) {
    return this.partnersService.create(dto);
  }

  /**
   * PUT /admin/partners/:id - Atualizar parceiro
   */
  @Put('partners/:id')
  async updatePartner(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePartnerDto,
  ) {
    return this.partnersService.update(id, dto);
  }

  /**
   * PATCH /admin/partners/:id/status - Ativar/desativar parceiro
   */
  @Patch('partners/:id/status')
  async updatePartnerStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: PartnerStatus,
  ) {
    return this.partnersService.updateStatus(id, status);
  }

  /**
   * DELETE /admin/partners/:id - Remover parceiro (soft delete)
   */
  @Delete('partners/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removePartner(@Param('id', ParseUUIDPipe) id: string) {
    return this.partnersService.remove(id);
  }

  // ===================== BENEFITS =====================

  /**
   * GET /admin/benefits - Listar todos os beneficios (todos parceiros)
   */
  @Get('benefits')
  async getBenefits(
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
   * POST /admin/benefits - Criar beneficio para um parceiro
   */
  @Post('benefits')
  @HttpCode(HttpStatus.CREATED)
  async createBenefit(@Body() dto: CreateBenefitDto) {
    return this.benefitsService.create(dto);
  }

  /**
   * PUT /admin/benefits/:id - Atualizar beneficio
   */
  @Put('benefits/:id')
  async updateBenefit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBenefitDto,
  ) {
    return this.benefitsService.update(id, dto);
  }

  // ===================== CAMPAIGNS =====================

  /**
   * GET /admin/campaigns - Listar campanhas
   */
  @Get('campaigns')
  async getCampaigns(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.campaignsService.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  /**
   * POST /admin/campaigns - Criar campanha
   */
  @Post('campaigns')
  @HttpCode(HttpStatus.CREATED)
  async createCampaign(
    @Body() dto: CreateCampaignDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.campaignsService.create(dto, userId);
  }

  /**
   * PUT /admin/campaigns/:id - Atualizar campanha
   */
  @Put('campaigns/:id')
  async updateCampaign(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCampaignDto,
  ) {
    return this.campaignsService.update(id, dto);
  }

  // ===================== MEMBERS =====================

  /**
   * GET /admin/members - Listar todos os associados
   */
  @Get('members')
  async getMembers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getMembers(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  // ===================== REPORTS =====================

  /**
   * GET /admin/reports/usage - Relatorio de uso de beneficios
   */
  @Get('reports/usage')
  async getUsageReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.getUsageReport(startDate, endDate);
  }

  /**
   * GET /admin/reports/points - Relatorio de pontos
   */
  @Get('reports/points')
  async getPointsReport() {
    return this.adminService.getPointsReport();
  }

  /**
   * GET /admin/reports/partners-ranking - Ranking de parceiros
   */
  @Get('reports/partners-ranking')
  async getPartnersRanking() {
    return this.adminService.getPartnersRanking();
  }
}
