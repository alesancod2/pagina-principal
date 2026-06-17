import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { firstValueFrom } from 'rxjs';

export interface AEasyAssociado {
  id?: string;
  nome: string;
  cpf: string;
  email?: string;
  telefone?: string;
  status: string;
  plano?: string;
  veiculo_placa?: string;
  veiculo_modelo?: string;
  veiculo_ano?: number;
  data_adesao?: string;
  adimplente?: boolean;
}

@Injectable()
export class AEasyService {
  private readonly logger = new Logger(AEasyService.name);
  private readonly baseUrl = process.env.AEASY_API_URL || 'https://api.autovaleprevencoes.org';
  private readonly token = process.env.AEASY_API_TOKEN;
  private readonly CACHE_TTL = 1800; // 30 minutos

  constructor(
    private readonly httpService: HttpService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  /**
   * Busca associado pelo CPF na API AEasy
   * Utiliza cache Redis de 30 minutos
   */
  async findByCpf(cpf: string): Promise<AEasyAssociado | null> {
    const cleanCpf = cpf.replace(/\D/g, '');
    const cacheKey = `aeasy:associado:${cleanCpf}`;

    // 1. Verificar cache
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit: ${cacheKey}`);
      return JSON.parse(cached);
    }

    // 2. Consultar API AEasy
    this.logger.log(`Consultando AEasy para CPF: ${cleanCpf.substring(0, 3)}***`);

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/associados`, {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
          params: { cpf: cleanCpf },
        }),
      );

      // Adaptar resposta conforme estrutura da API AEasy
      const data = response.data;
      let associado: AEasyAssociado | null = null;

      // A API pode retornar array ou objeto único
      if (Array.isArray(data?.data)) {
        associado = data.data.find((a: any) => 
          a.cpf?.replace(/\D/g, '') === cleanCpf
        );
      } else if (data?.cpf) {
        associado = data;
      } else if (data?.data?.cpf) {
        associado = data.data;
      }

      if (!associado) {
        this.logger.warn(`CPF não encontrado na AEasy: ${cleanCpf.substring(0, 3)}***`);
        return null;
      }

      // Normalizar dados
      const normalized: AEasyAssociado = {
        id: associado.id || undefined,
        nome: associado.nome || associado.name || '',
        cpf: cleanCpf,
        email: associado.email || undefined,
        telefone: associado.telefone || associado.phone || undefined,
        status: (associado.status || '').toUpperCase(),
        plano: associado.plano || associado.plan || undefined,
        veiculo_placa: associado.veiculo_placa || associado.plate || undefined,
        veiculo_modelo: associado.veiculo_modelo || associado.vehicle || undefined,
        veiculo_ano: associado.veiculo_ano || undefined,
        data_adesao: associado.data_adesao || undefined,
        adimplente: this.checkCompliance(associado),
      };

      // 3. Salvar no cache
      await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(normalized));

      return normalized;
    } catch (error) {
      this.logger.error(`Erro ao consultar AEasy: ${error.message}`);
      
      // Se API estiver fora, tentar cache expirado
      const staleCache = await this.redis.get(`${cacheKey}:stale`);
      if (staleCache) {
        this.logger.warn('Usando cache stale (API indisponível)');
        return JSON.parse(staleCache);
      }

      throw new UnauthorizedException('Serviço de validação indisponível. Tente novamente.');
    }
  }

  /**
   * Verifica se o status permite acesso
   */
  isStatusActive(status: string): boolean {
    const activeStatuses = ['ATIVO', 'ATIVA', 'ACTIVE', 'ADIMPLENTE'];
    return activeStatuses.includes(status.toUpperCase());
  }

  /**
   * Verifica se o status permite login (mesmo inadimplente)
   */
  isStatusLoginAllowed(status: string): boolean {
    const blockedStatuses = ['CANCELADO', 'ENCERRADO', 'EXCLUIDO'];
    return !blockedStatuses.includes(status.toUpperCase());
  }

  /**
   * Invalida cache de um CPF
   */
  async invalidateCache(cpf: string): Promise<void> {
    const cleanCpf = cpf.replace(/\D/g, '');
    await this.redis.del(`aeasy:associado:${cleanCpf}`);
  }

  private checkCompliance(associado: any): boolean {
    if (associado.adimplente !== undefined) return !!associado.adimplente;
    if (associado.is_compliant !== undefined) return !!associado.is_compliant;
    const status = (associado.status || '').toUpperCase();
    return ['ATIVO', 'ATIVA', 'ACTIVE', 'ADIMPLENTE'].includes(status);
  }
}
