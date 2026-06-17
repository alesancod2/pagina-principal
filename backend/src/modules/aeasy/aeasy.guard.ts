import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Association } from '../users/entities/association.entity';

/**
 * Guard que valida adimplência antes de:
 * - Gerar Cupom
 * - Utilizar Benefício
 * - Resgatar Pontos
 * - Cashback
 */
@Injectable()
export class AssociationGuard implements CanActivate {
  constructor(
    @InjectRepository(Association)
    private readonly associationRepo: Repository<Association>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    // Admin e gestores não precisam de validação de adimplência
    if (['admin', 'manager'].includes(user.role)) {
      return true;
    }

    // Buscar associação do usuário
    const association = await this.associationRepo.findOne({
      where: { user: { id: user.id } },
    });

    if (!association) {
      throw new ForbiddenException('Você não possui associação ativa com a Auto Vale Prevenções.');
    }

    if (!association.isCompliant) {
      throw new ForbiddenException(
        'Regularize sua associação para utilizar os benefícios exclusivos do Clube Auto Vale.',
      );
    }

    if (association.status !== 'active') {
      throw new ForbiddenException(
        'Sua associação não está ativa. Entre em contato com a Auto Vale Prevenções.',
      );
    }

    return true;
  }
}
