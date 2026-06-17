import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Campaign, CampaignStatus } from './entities/campaign.entity';
import { CreateCampaignDto, UpdateCampaignDto } from './dto/create-campaign.dto';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
  ) {}

  /**
   * Listar todas as campanhas com paginacao
   */
  async findAll(page: number = 1, limit: number = 20): Promise<PaginatedResult<Campaign>> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.campaignRepository.findAndCount({
      relations: ['partner'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Buscar campanha por ID
   */
  async findById(id: string): Promise<Campaign> {
    const campaign = await this.campaignRepository.findOne({
      where: { id },
      relations: ['partner'],
    });

    if (!campaign) {
      throw new NotFoundException(`Campanha com ID "${id}" nao encontrada`);
    }

    return campaign;
  }

  /**
   * Obter campanhas ativas (para exibicao no marketplace)
   */
  async getActiveCampaigns(): Promise<Campaign[]> {
    const now = new Date();

    return this.campaignRepository.find({
      where: {
        status: CampaignStatus.ACTIVE,
        startDate: LessThanOrEqual(now),
        endDate: MoreThanOrEqual(now),
      },
      relations: ['partner'],
      order: { startDate: 'DESC' },
    });
  }

  /**
   * Criar nova campanha
   */
  async create(dto: CreateCampaignDto, createdBy?: string): Promise<Campaign> {
    const campaign = this.campaignRepository.create({
      ...dto,
      createdBy,
    });
    return this.campaignRepository.save(campaign);
  }

  /**
   * Atualizar campanha existente
   */
  async update(id: string, dto: UpdateCampaignDto): Promise<Campaign> {
    const campaign = await this.findById(id);
    Object.assign(campaign, dto);
    return this.campaignRepository.save(campaign);
  }

  /**
   * Remover campanha (soft delete via status)
   */
  async remove(id: string): Promise<void> {
    const campaign = await this.findById(id);
    campaign.status = CampaignStatus.ENDED;
    await this.campaignRepository.save(campaign);
  }
}
