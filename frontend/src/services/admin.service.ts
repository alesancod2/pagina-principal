import api from './api';
import { Partner, PaginatedResponse, Benefit } from './partners.service';

// ===================== INTERFACES =====================

export interface DashboardStats {
  totalMembers: number;
  totalPartners: number;
  totalBenefitsUsed: number;
  totalPointsDistributed: number;
  totalCouponsGenerated: number;
  activeBenefits: number;
  activePartners: number;
  newMembersThisMonth: number;
}

export interface MonthlyStats {
  month: string;
  benefitsUsed: number;
  pointsDistributed: number;
  couponsGenerated: number;
  newMembers: number;
}

export interface Campaign {
  id: string;
  title: string;
  description?: string;
  campaignType: string;
  status: string;
  partnerId?: string;
  startDate: string;
  endDate: string;
  bonusPoints: number;
  bonusDiscount: number;
  maxParticipants?: number;
  currentParticipants: number;
  bannerUrl?: string;
  termsConditions?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  partner?: Partner;
}

export interface CreateCampaignPayload {
  title: string;
  description?: string;
  campaignType?: string;
  status?: string;
  partnerId?: string;
  startDate: string;
  endDate: string;
  bonusPoints?: number;
  bonusDiscount?: number;
  maxParticipants?: number;
  bannerUrl?: string;
  termsConditions?: string;
}

export interface UpdateCampaignPayload extends Partial<CreateCampaignPayload> {}

export interface UsageReport {
  data: any[];
  total: number;
  period: { start: string; end: string };
}

export interface PointsReport {
  totalEarned: number;
  totalRedeemed: number;
  totalExpired: number;
  averagePerUser: number;
  topEarners: { userId: string; name: string; total: number }[];
}

export interface PartnerRanking {
  partnerId: string;
  companyName: string;
  tradeName: string;
  totalUsages: number;
  totalPointsGenerated: number;
  totalCoupons: number;
  rating: number;
}

export interface AdminMember {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone?: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  association?: {
    id: string;
    planName: string;
    planType: string;
    status: string;
    isCompliant: boolean;
    vehiclePlate?: string;
    vehicleModel?: string;
  };
}

export interface CreatePartnerPayload {
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
}

export interface UpdatePartnerPayload extends Partial<CreatePartnerPayload> {
  status?: string;
}

export interface CreateBenefitPayload {
  partnerId: string;
  title: string;
  description?: string;
  benefitType: string;
  discountPercent?: number;
  discountFixed?: number;
  cashbackPercent?: number;
  pointsGenerated?: number;
  pointsRequired?: number;
  startDate?: string;
  endDate?: string;
  maxUses?: number;
  maxUsesPerUser?: number;
  daysAvailable?: string;
}

export interface UpdateBenefitPayload extends Partial<CreateBenefitPayload> {
  isActive?: boolean;
}

// ===================== SERVICE =====================

export const adminService = {
  // ===== STATS =====

  async getStats(): Promise<DashboardStats> {
    const { data } = await api.get('/admin/stats');
    return data;
  },

  async getMonthlyStats(): Promise<MonthlyStats[]> {
    const { data } = await api.get('/admin/stats/monthly');
    return data;
  },

  // ===== PARTNERS =====

  async getPartners(params?: {
    category?: string;
    city?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<PaginatedResponse<Partner>> {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.city) queryParams.append('city', params.city);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.sort) queryParams.append('sort', params.sort);

    const { data } = await api.get(`/admin/partners?${queryParams.toString()}`);
    return data;
  },

  async createPartner(payload: CreatePartnerPayload): Promise<Partner> {
    const { data } = await api.post('/admin/partners', payload);
    return data;
  },

  async updatePartner(id: string, payload: UpdatePartnerPayload): Promise<Partner> {
    const { data } = await api.put(`/admin/partners/${id}`, payload);
    return data;
  },

  async updatePartnerStatus(id: string, status: string): Promise<Partner> {
    const { data } = await api.patch(`/admin/partners/${id}/status`, { status });
    return data;
  },

  async deletePartner(id: string): Promise<void> {
    await api.delete(`/admin/partners/${id}`);
  },

  // ===== BENEFITS =====

  async getBenefits(page?: number, limit?: number): Promise<PaginatedResponse<Benefit>> {
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', String(page));
    if (limit) queryParams.append('limit', String(limit));
    const { data } = await api.get(`/admin/benefits?${queryParams.toString()}`);
    return data;
  },

  async createBenefit(payload: CreateBenefitPayload): Promise<Benefit> {
    const { data } = await api.post('/admin/benefits', payload);
    return data;
  },

  async updateBenefit(id: string, payload: UpdateBenefitPayload): Promise<Benefit> {
    const { data } = await api.put(`/admin/benefits/${id}`, payload);
    return data;
  },

  // ===== CAMPAIGNS =====

  async getCampaigns(page?: number, limit?: number): Promise<PaginatedResponse<Campaign>> {
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', String(page));
    if (limit) queryParams.append('limit', String(limit));
    const { data } = await api.get(`/admin/campaigns?${queryParams.toString()}`);
    return data;
  },

  async createCampaign(payload: CreateCampaignPayload): Promise<Campaign> {
    const { data } = await api.post('/admin/campaigns', payload);
    return data;
  },

  async updateCampaign(id: string, payload: UpdateCampaignPayload): Promise<Campaign> {
    const { data } = await api.put(`/admin/campaigns/${id}`, payload);
    return data;
  },

  // ===== MEMBERS =====

  async getMembers(page?: number, limit?: number): Promise<PaginatedResponse<AdminMember>> {
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', String(page));
    if (limit) queryParams.append('limit', String(limit));
    const { data } = await api.get(`/admin/members?${queryParams.toString()}`);
    return data;
  },

  // ===== REPORTS =====

  async getUsageReport(startDate?: string, endDate?: string): Promise<UsageReport> {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    const { data } = await api.get(`/admin/reports/usage?${queryParams.toString()}`);
    return data;
  },

  async getPointsReport(): Promise<PointsReport> {
    const { data } = await api.get('/admin/reports/points');
    return data;
  },

  async getPartnersRanking(): Promise<PartnerRanking[]> {
    const { data } = await api.get('/admin/reports/partners-ranking');
    return data;
  },
};
