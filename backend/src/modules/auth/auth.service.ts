import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { UsersService } from '../users/users.service';
import { AEasyService } from '../aeasy/aeasy.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshToken } from './entities/refresh-token.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly aeasyService: AEasyService,
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
  ) {}

  /**
   * LOGIN VIA CPF (Integração AEasy)
   * 1. Valida CPF na API AEasy
   * 2. Verifica status (ativo/inadimplente/cancelado)
   * 3. Cria usuário local se não existir (auto-cadastro)
   * 4. Atualiza dados do associado a cada login
   * 5. Gera JWT + Refresh Token
   */
  async cpfLogin(cpf: string) {
    const cleanCpf = cpf.replace(/\D/g, '');
    this.logger.log(`CPF Login: ${cleanCpf.substring(0, 3)}***`);

    // 1. Consultar API AEasy
    const associado = await this.aeasyService.findByCpf(cleanCpf);
    if (!associado) {
      throw new UnauthorizedException(
        'CPF não encontrado na base da Auto Vale Prevenções. Verifique se você é associado.'
      );
    }

    // 2. Verificar se o status permite login
    if (!this.aeasyService.isStatusLoginAllowed(associado.status)) {
      throw new UnauthorizedException(
        'Sua associação foi cancelada ou encerrada. Entre em contato com a Auto Vale Prevenções.'
      );
    }

    // 3. Buscar ou criar usuário local
    let user = await this.usersService.findByCpf(cleanCpf);

    if (!user) {
      // Auto-cadastro: criar usuário automaticamente
      this.logger.log(`Auto-cadastro: criando usuário para CPF ${cleanCpf.substring(0, 3)}***`);
      const passwordHash = await bcrypt.hash(cleanCpf, 10); // CPF como senha padrão
      user = await this.usersService.create({
        name: associado.nome,
        email: associado.email || `${cleanCpf}@autovale.local`,
        cpf: cleanCpf,
        phone: associado.telefone,
        passwordHash,
        role: 'member',
      });
    }

    // 4. Atualizar dados com informações da AEasy
    await this.usersService.syncWithAEasy(user.id, associado);

    // 5. Atualizar último login
    await this.usersService.updateLastLogin(user.id);

    // 6. Gerar tokens
    const tokens = await this.generateTokens(user);

    // 7. Determinar se é adimplente
    const isCompliant = this.aeasyService.isStatusActive(associado.status) && associado.adimplente !== false;

    return {
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        name: associado.nome,
        email: user.email,
        cpf: cleanCpf,
        role: user.role,
        status: associado.status,
        plano: associado.plano,
        isCompliant,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Conta desativada. Entre em contato com o suporte.');
    }

    // Atualizar último login
    await this.usersService.updateLastLogin(user.id);

    // Gerar tokens
    const tokens = await this.generateTokens(user);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async register(dto: RegisterDto) {
    const existingEmail = await this.usersService.findByEmail(dto.email);
    if (existingEmail) {
      throw new BadRequestException('E-mail já cadastrado');
    }

    const existingCpf = await this.usersService.findByCpf(dto.cpf);
    if (existingCpf) {
      throw new BadRequestException('CPF já cadastrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      cpf: dto.cpf,
      phone: dto.phone,
      passwordHash,
      role: 'member',
    });

    const tokens = await this.generateTokens(user);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async refreshAccessToken(refreshToken: string) {
    const stored = await this.refreshTokenRepo.findOne({
      where: { token: refreshToken },
      relations: ['user'],
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }

    // Revogar token antigo
    stored.revokedAt = new Date();
    await this.refreshTokenRepo.save(stored);

    // Gerar novos tokens
    const tokens = await this.generateTokens(stored.user);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(userId: string) {
    await this.refreshTokenRepo.update(
      { user: { id: userId }, revokedAt: null },
      { revokedAt: new Date() },
    );
    return { message: 'Logout realizado com sucesso' };
  }

  private async generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    // Criar refresh token
    const refreshToken = uuid();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias

    await this.refreshTokenRepo.save({
      user: { id: user.id },
      token: refreshToken,
      expiresAt,
    });

    return { accessToken, refreshToken };
  }
}
