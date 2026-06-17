import { Controller, Post, Body, Get, UseGuards, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CpfLoginDto } from '../aeasy/aeasy.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Login principal via CPF (integração AEasy)
   * O CPF é validado na API AEasy da Auto Vale Prevenções
   */
  @Post('cpf-login')
  @HttpCode(200)
  async cpfLogin(@Body() dto: CpfLoginDto) {
    return this.authService.cpfLogin(dto.cpf);
  }

  /**
   * Login tradicional (email + senha) - fallback/admin
   */
  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshAccessToken(dto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async logout(@CurrentUser() user: any) {
    return this.authService.logout(user.id);
  }

  /**
   * Dados do usuário logado (Etapa 2: GET /users/me)
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: any) {
    return this.usersService.getMe(user.id);
  }
}
