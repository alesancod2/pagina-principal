import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Partner, PartnerStatus } from './entities/partner.entity';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PartnerFilters {
  category?: string;
  city?: string;
  status?: PartnerStatus;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

@Injectable()
export class PartnersService {
  constructor(
    @InjectRepository(Partner)
    private readonly partnerRepository: Repository<Partner>,
  ) {}

  async findAll(filters: PartnerFilters): Promise<PaginatedResult<Partner>> {
    const {
      category,
      city,
      status,
      search,
      page = 1,
      limit = 10,
      sort = 'createdAt:DESC',
    } = filters;

    const query = this.partnerRepository.createQueryBuilder('partner');

    if (category) {
      query.andWhere('partner.category = :category', { category });
    }

    if (city) {
      query.andWhere('LOWER(partner.city) = LOWER(:city)', { city });
    }

    if (status) {
      query.andWhere('partner.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        '(LOWER(partner.company_name) LIKE LOWER(:search) OR LOWER(partner.trade_name) LIKE LOWER(:search) OR LOWER(partner.description) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    // Sorting
    const [sortField, sortOrder] = sort.split(':');
    const allowedSortFields = ['createdAt', 'companyName', 'rating', 'city', 'category'];
    const field = allowedSortFields.includes(sortField) ? sortField : 'createdAt';
    const order = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query.orderBy(`partner.${field}`, order);

    // Pagination
    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<Partner> {
    const partner = await this.partnerRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!partner) {
      throw new NotFoundException(`Parceiro com ID "${id}" não encontrado`);
    }

    return partner;
  }

  async findNearby(
    lat: number,
    lng: number,
    radius: number = 10,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResult<Partner & { distance: number }>> {
    const skip = (page - 1) * limit;

    // PostGIS ST_DWithin for efficient radius search
    // ST_DistanceSphere calculates distance in meters
    const query = this.partnerRepository
      .createQueryBuilder('partner')
      .addSelect(
        `ST_DistanceSphere(
          ST_MakePoint(partner.longitude, partner.latitude),
          ST_MakePoint(:lng, :lat)
        )`,
        'distance',
      )
      .where('partner.status = :status', { status: PartnerStatus.ACTIVE })
      .andWhere('partner.latitude IS NOT NULL')
      .andWhere('partner.longitude IS NOT NULL')
      .andWhere(
        `ST_DWithin(
          partner.geom,
          ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
          :radiusMeters
        )`,
      )
      .setParameters({
        lat,
        lng,
        radiusMeters: radius * 1000, // Convert km to meters
      })
      .orderBy('distance', 'ASC')
      .skip(skip)
      .take(limit);

    const [data, total] = await query.getManyAndCount();

    // Map results with distance
    const results = data.map((partner) => ({
      ...partner,
      distance: 0, // Will be populated by raw query
    }));

    // Use raw query to get actual distances
    const rawResults = await this.partnerRepository
      .createQueryBuilder('partner')
      .select('partner.id', 'id')
      .addSelect(
        `ROUND(ST_DistanceSphere(
          ST_MakePoint(partner.longitude, partner.latitude),
          ST_MakePoint(:lng, :lat)
        )::numeric / 1000, 2)`,
        'distance_km',
      )
      .where('partner.status = :status', { status: PartnerStatus.ACTIVE })
      .andWhere('partner.latitude IS NOT NULL')
      .andWhere('partner.longitude IS NOT NULL')
      .andWhere(
        `ST_DWithin(
          partner.geom,
          ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
          :radiusMeters
        )`,
      )
      .setParameters({
        lat,
        lng,
        radiusMeters: radius * 1000,
        status: PartnerStatus.ACTIVE,
      })
      .orderBy('distance_km', 'ASC')
      .skip(skip)
      .take(limit)
      .getRawMany();

    const distanceMap = new Map(
      rawResults.map((r: any) => [r.id, parseFloat(r.distance_km)]),
    );

    const dataWithDistance = data.map((partner) => ({
      ...partner,
      distance: distanceMap.get(partner.id) || 0,
    }));

    return {
      data: dataWithDistance,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(createPartnerDto: CreatePartnerDto): Promise<Partner> {
    const partner = this.partnerRepository.create(createPartnerDto);
    return this.partnerRepository.save(partner);
  }

  async update(id: string, updatePartnerDto: UpdatePartnerDto): Promise<Partner> {
    const partner = await this.findById(id);
    Object.assign(partner, updatePartnerDto);
    return this.partnerRepository.save(partner);
  }

  async updateStatus(id: string, status: PartnerStatus): Promise<Partner> {
    const partner = await this.findById(id);
    partner.status = status;
    return this.partnerRepository.save(partner);
  }

  async remove(id: string): Promise<void> {
    const partner = await this.findById(id);
    partner.status = PartnerStatus.INACTIVE;
    await this.partnerRepository.save(partner);
  }
}
