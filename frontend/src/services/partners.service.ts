import api from './api';

// ===================== INTERFACES =====================

export interface Partner {
  id: string;
  companyName: string;
  tradeName?: string;
  cnpj: string;
  category: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  coverUrl?: string;
  rating: number;
  totalRatings: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  distance?: number;
}

export interface Benefit {
  id: string;
  partnerId: string;
  title: string;
  description?: string;
  benefitType: string;
  discountPercent?: number;
  discountFixed?: number;
  cashbackPercent?: number;
  pointsGenerated: number;
  pointsRequired: number;
  startDate?: string;
  endDate?: string;
  maxUses?: number;
  maxUsesPerUser?: number;
  currentUses: number;
  requiresCompliance: boolean;
  daysAvailable: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  partner?: Partner;
}

export interface BenefitUsage {
  id: string;
  userId: string;
  partnerId: string;
  benefitId: string;
  amount?: number;
  discountApplied?: number;
  pointsEarned: number;
  notes?: string;
  usedAt: string;
  benefit?: Benefit;
  partner?: Partner;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PartnerFilters {
  category?: string;
  city?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface NearbyParams {
  lat: number;
  lng: number;
  radius?: number;
  page?: number;
  limit?: number;
}

export interface UseBenefitPayload {
  benefitId: string;
  partnerId: string;
  amount?: number;
  notes?: string;
}

// ===================== SERVICES =====================

export const partnersService = {
  /**
   * Listar parceiros com filtros e paginacao
   */
  async getPartners(filters?: PartnerFilters): Promise<PaginatedResponse<Partner>> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.city) params.append('city', filters.city);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.sort) params.append('sort', filters.sort);

    const { data } = await api.get(`/partners?${params.toString()}`);
    return data;
  },

  /**
   * Buscar parceiro por ID
   */
  async getPartnerById(id: string): Promise<Partner> {
    const { data } = await api.get(`/partners/${id}`);
    return data;
  },

  /**
   * Buscar parceiros proximos (geolocation)
   */
  async getNearbyPartners(params: NearbyParams): Promise<PaginatedResponse<Partner>> {
    const queryParams = new URLSearchParams({
      lat: String(params.lat),
      lng: String(params.lng),
    });
    if (params.radius) queryParams.append('radius', String(params.radius));
    if (params.page) queryParams.append('page', String(params.page));
    if (params.limit) queryParams.append('limit', String(params.limit));

    const { data } = await api.get(`/partners/nearby?${queryParams.toString()}`);
    return data;
  },

  /**
   * Listar beneficios ativos (todos ou por parceiro)
   */
  async getBenefits(partnerId?: string, page?: number, limit?: number): Promise<PaginatedResponse<Benefit>> {
    if (partnerId) {
      const params = new URLSearchParams();
      if (page) params.append('page', String(page));
      if (limit) params.append('limit', String(limit));
      const { data } = await api.get(`/benefits/partner/${partnerId}?${params.toString()}`);
      return data;
    }

    const params = new URLSearchParams();
    if (page) params.append('page', String(page));
    if (limit) params.append('limit', String(limit));
    const { data } = await api.get(`/benefits?${params.toString()}`);
    return data;
  },

  /**
   * Buscar beneficio por ID
   */
  async getBenefitById(id: string): Promise<Benefit> {
    const { data } = await api.get(`/benefits/${id}`);
    return data;
  },

  /**
   * Utilizar um beneficio
   */
  async useBenefit(id: string, payload: UseBenefitPayload): Promise<BenefitUsage> {
    const { data } = await api.post(`/benefits/${id}/use`, payload);
    return data;
  },

  /**
   * Historico de uso de beneficios do usuario
   */
  async getMyBenefitHistory(page?: number, limit?: number): Promise<PaginatedResponse<BenefitUsage>> {
    const params = new URLSearchParams();
    if (page) params.append('page', String(page));
    if (limit) params.append('limit', String(limit));
    const { data } = await api.get(`/benefits/my-history?${params.toString()}`);
    return data;
  },
};
