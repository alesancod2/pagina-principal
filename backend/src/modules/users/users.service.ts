import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async findByCpf(cpf: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { cpf } });
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepo.update(id, { lastLoginAt: new Date() });
  }

  async getMe(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['association'],
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      cpf: user.cpf,
      phone: user.phone,
      role: user.role,
      avatarUrl: user.avatarUrl,
      association: user.association ? {
        planName: user.association.planName,
        planType: user.association.planType,
        status: user.association.status,
        isCompliant: user.association.isCompliant,
        vehiclePlate: user.association.vehiclePlate,
        vehicleModel: user.association.vehicleModel,
      } : null,
    };
  }

  /**
   * Sincroniza dados do usuário local com a API AEasy
   * Chamado a cada login via CPF
   */
  async syncWithAEasy(userId: string, aeasyData: any): Promise<void> {
    // Atualizar dados do usuário
    await this.userRepo.update(userId, {
      name: aeasyData.nome,
      phone: aeasyData.telefone || undefined,
    });

    // Atualizar ou criar associação
    const association = await this.userRepo.manager.findOne(
      require('./entities/association.entity').Association,
      { where: { user: { id: userId } } },
    );

    const associationData = {
      planName: aeasyData.plano || 'Proteção Veicular',
      planType: aeasyData.plano || 'standard',
      status: this.mapAEasyStatus(aeasyData.status),
      isCompliant: aeasyData.adimplente !== false,
      vehiclePlate: aeasyData.veiculo_placa || undefined,
      vehicleModel: aeasyData.veiculo_modelo || undefined,
    };

    if (association) {
      await this.userRepo.manager.update(
        require('./entities/association.entity').Association,
        association.id,
        associationData,
      );
    } else {
      await this.userRepo.manager.save(
        require('./entities/association.entity').Association,
        { user: { id: userId }, startDate: new Date(), ...associationData },
      );
    }
  }

  private mapAEasyStatus(status: string): string {
    const s = (status || '').toUpperCase();
    if (['ATIVO', 'ATIVA', 'ACTIVE', 'ADIMPLENTE'].includes(s)) return 'active';
    if (['INADIMPLENTE', 'SUSPENSO'].includes(s)) return 'overdue';
    if (['CANCELADO', 'ENCERRADO', 'EXCLUIDO'].includes(s)) return 'cancelled';
    return 'inactive';
  }
}
