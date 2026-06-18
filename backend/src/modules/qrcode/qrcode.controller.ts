import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { QrCodeService } from './qrcode.service';
import { ValidateQrDto } from './dto/validate-qr.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('api/qrcode')
export class QrCodeController {
  constructor(private readonly qrCodeService: QrCodeService) {}

  /**
   * POST /api/qrcode/validate
   * Cliente escaneia o QR Code universal
   * Requer JWT do cliente autenticado
   */
  @Post('validate')
  @UseGuards(JwtAuthGuard)
  async validateQr(@Req() req: any, @Body() dto: ValidateQrDto) {
    const clientId = req.user.sub || req.user.id;
    return this.qrCodeService.validateQrUsage(
      clientId,
      dto.partnerSessionId,
      dto.qrPayload,
      dto.deviceInfo,
    );
  }

  /**
   * POST /api/qrcode/complete/:sessionId
   * Parceiro confirma a utilização
   */
  @Post('complete/:sessionId')
  @UseGuards(JwtAuthGuard)
  async completeUsage(
    @Param('sessionId') sessionId: string,
    @Body() body: { benefitId?: string; pointsEarned?: number },
  ) {
    return this.qrCodeService.completeUsage(
      sessionId,
      body.benefitId,
      body.pointsEarned,
    );
  }

  /**
   * GET /api/qrcode/history
   * Histórico de utilizações do cliente autenticado
   */
  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getHistory(@Req() req: any) {
    const clientId = req.user.sub || req.user.id;
    return this.qrCodeService.getClientHistory(clientId);
  }

  /**
   * GET /api/qrcode/partner-sessions
   * Sessões validadas para o parceiro autenticado
   */
  @Get('partner-sessions')
  @UseGuards(JwtAuthGuard)
  async getPartnerSessions(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('date') date?: string,
  ) {
    const partnerId = req.user.partnerId || req.user.sub;
    return this.qrCodeService.getPartnerSessions(partnerId, { status, date });
  }

  /**
   * GET /api/qrcode/config
   * Retorna payload e URL do QR Code para exibição
   */
  @Get('config')
  async getQrConfig() {
    return this.qrCodeService.getQrConfig();
  }

  /**
   * Web validation endpoint - when QR is scanned by native camera
   * Redirects to confirmation page or error page
   * GET /api/qrcode/q/:token
   */
  @Get('q/:token')
  async validateFromWeb(@Param('token') token: string, @Req() req: any) {
    try {
      const result = await this.qrCodeService.validateWebToken(token, {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      });
      // In production: redirect to confirmation page with session data
      return {
        success: true,
        redirect: `/qr-confirmacao.html?session=${result.protocol}`,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        redirect: '/qr-erro.html',
        error: error.message,
      };
    }
  }
}
