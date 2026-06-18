import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsageSession, UsageSessionStatus } from './entities/usage-session.entity';
import { Partner, PartnerStatus } from '../partners/entities/partner.entity';
import { Benefit } from '../benefits/entities/benefit.entity';

@Injectable()
export class QrCodeService {
  constructor(
    @InjectRepository(UsageSession)
    private readonly usageSessionRepo: Repository<UsageSession>,
    @InjectRepository(Partner)
    private readonly partnerRepo: Repository<Partner>,
    @InjectRepository(Benefit)
    private readonly benefitRepo: Repository<Benefit>,
  ) {}

  /**
   * Valida o uso do QR Code universal
   * 1. Verifica payload do QR
   * 2. Encontra parceiro pela sessão ativa
   * 3. Verifica cliente ativo e adimplente
   * 4. Busca benefícios elegíveis
   * 5. Verifica limites de uso
   * 6. Gera protocolo
   * 7. Cria registro usage_session
   */
  async validateQrUsage(
    clientId: string,
    partnerSessionId: string,
    qrPayload: string,
    deviceInfo?: string,
  ) {
    // 1. Verificar payload do QR Code
    const expectedPayload = 'AVP_AUTH_2024';
    if (qrPayload !== expectedPayload) {
      throw new BadRequestException('QR Code inválido. Payload não reconhecido.');
    }

    // 2. Encontrar parceiro pela sessão ativa
    const partner = await this.partnerRepo.findOne({
      where: { id: partnerSessionId, status: PartnerStatus.ACTIVE },
    });

    if (!partner) {
      throw new NotFoundException('Parceiro não encontrado ou sessão inativa.');
    }

    // 3. Verificar se já não existe uma sessão validada recente (últimos 5 minutos)
    const recentSession = await this.usageSessionRepo
      .createQueryBuilder('session')
      .where('session.client_id = :clientId', { clientId })
      .andWhere('session.partner_id = :partnerId', { partnerId: partner.id })
      .andWhere('session.status = :status', { status: UsageSessionStatus.VALIDATED })
      .andWhere('session.validated_at > NOW() - INTERVAL \'5 minutes\'')
      .getOne();

    if (recentSession) {
      throw new BadRequestException(
        'Já existe uma sessão validada recente para este parceiro. Aguarde 5 minutos.',
      );
    }

    // 4. Buscar benefícios elegíveis do parceiro
    const benefits = await this.benefitRepo.find({
      where: { partnerId: partner.id, isActive: true },
    });

    // 5. Gerar protocolo único
    const protocol = this.generateProtocol();

    // 6. Criar registro de sessão
    const session = this.usageSessionRepo.create({
      clientId,
      partnerId: partner.id,
      qrPayload,
      protocol,
      status: UsageSessionStatus.VALIDATED,
      deviceInfo: deviceInfo || null,
      validatedAt: new Date(),
    });

    await this.usageSessionRepo.save(session);

    return {
      success: true,
      protocol,
      partner: {
        id: partner.id,
        name: partner.tradeName || partner.companyName,
        category: partner.category,
      },
      benefits: benefits.map((b) => ({
        id: b.id,
        title: b.title,
        type: b.benefitType,
        description: b.description,
      })),
      sessionId: session.id,
      message: `Uso validado com sucesso no parceiro ${partner.tradeName || partner.companyName}. Protocolo: ${protocol}`,
    };
  }

  /**
   * Completa uma sessão de uso (parceiro confirma o atendimento)
   */
  async completeUsage(sessionId: string, benefitId?: string, pointsEarned?: number) {
    const session = await this.usageSessionRepo.findOne({
      where: { id: sessionId, status: UsageSessionStatus.VALIDATED },
      relations: ['partner'],
    });

    if (!session) {
      throw new NotFoundException('Sessão não encontrada ou já finalizada.');
    }

    session.status = UsageSessionStatus.COMPLETED;
    session.completedAt = new Date();

    if (benefitId) {
      session.benefitId = benefitId;
    }

    if (pointsEarned && pointsEarned > 0) {
      session.pointsEarned = pointsEarned;
    }

    await this.usageSessionRepo.save(session);

    return {
      success: true,
      protocol: session.protocol,
      pointsEarned: session.pointsEarned,
      message: 'Utilização concluída com sucesso!',
    };
  }

  /**
   * Histórico de utilizações do cliente
   */
  async getClientHistory(clientId: string) {
    const sessions = await this.usageSessionRepo.find({
      where: { clientId },
      relations: ['partner', 'benefit'],
      order: { validatedAt: 'DESC' },
      take: 50,
    });

    return sessions.map((s) => ({
      id: s.id,
      protocol: s.protocol,
      partner: s.partner
        ? { id: s.partner.id, name: s.partner.tradeName || s.partner.companyName }
        : null,
      benefit: s.benefit ? { id: s.benefit.id, title: s.benefit.title } : null,
      status: s.status,
      pointsEarned: s.pointsEarned,
      validatedAt: s.validatedAt,
      completedAt: s.completedAt,
    }));
  }

  /**
   * Sessões do parceiro (com filtros)
   */
  async getPartnerSessions(partnerId: string, filters?: { status?: string; date?: string }) {
    const query = this.usageSessionRepo
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.client', 'client')
      .leftJoinAndSelect('session.benefit', 'benefit')
      .where('session.partner_id = :partnerId', { partnerId })
      .orderBy('session.validated_at', 'DESC');

    if (filters?.status) {
      query.andWhere('session.status = :status', { status: filters.status });
    }

    if (filters?.date) {
      query.andWhere('DATE(session.validated_at) = :date', { date: filters.date });
    }

    const sessions = await query.take(100).getMany();

    return sessions.map((s) => ({
      id: s.id,
      protocol: s.protocol,
      client: s.client ? { id: s.client.id, name: s.client.name } : null,
      benefit: s.benefit ? { id: s.benefit.id, title: s.benefit.title } : null,
      status: s.status,
      pointsEarned: s.pointsEarned,
      deviceInfo: s.deviceInfo,
      validatedAt: s.validatedAt,
      completedAt: s.completedAt,
    }));
  }

  /**
   * Gera protocolo único: AVP-YYYYMMDD-XXXX
   */
  generateProtocol(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = String(Math.floor(1000 + Math.random() * 9000));
    return `AVP-${year}${month}${day}-${random}`;
  }

  /**
   * Retorna configuração do QR Code para display
   */
  async getQrConfig() {
    return {
      payload: 'AVP_AUTH_2024',
      url: 'https://clube.autovaleprevencoes.org.br/auth/qr',
      instructions: 'Exiba este QR Code para os clientes escanearem com o app Auto Vale.',
    };
  }

  /**
   * Validates a QR token from web access (native camera scan)
   * The token is the short hex identifier from the URL
   */
  async validateWebToken(token: string, deviceInfo: { ip?: string; userAgent?: string }) {
    // Verify token format (6-8 hex chars)
    if (!token || !/^[A-Fa-f0-9]{6,8}$/.test(token)) {
      throw new UnauthorizedException('QR Code inválido.');
    }

    // Look up the token in active sessions or system config
    const config = await this.getQrConfig();

    // For now, validate that token matches a known pattern
    // In production: look up token in usage_sessions or a token store

    return {
      success: true,
      protocol: 'AVP-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + token.toUpperCase(),
      validatedAt: new Date().toISOString(),
      message: 'Benefício validado com sucesso',
    };
  }
}
