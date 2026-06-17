import api from './api';

// ===================== INTERFACES =====================

export interface Coupon {
  id: string;
  userId: string;
  partnerId: string;
  benefitId: string;
  code: string;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  discountPercent: number | null;
  discountFixed: number | null;
  expiresAt: string;
  usedAt: string | null;
  validatedBy: string | null;
  createdAt: string;
  updatedAt: string;
  partner?: {
    id: string;
    companyName: string;
    tradeName: string;
    logoUrl: string;
    category: string;
  };
  benefit?: {
    id: string;
    title: string;
    description: string;
    benefitType: string;
  };
}

export interface CouponValidation {
  valid: boolean;
  coupon?: Coupon;
  reason?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GenerateCouponPayload {
  benefitId: string;
  partnerId: string;
}

// ===================== SERVICE =====================

export const couponsService = {
  /**
   * Listar meus cupons
   */
  async getMyCoupons(page?: number, limit?: number): Promise<PaginatedResponse<Coupon>> {
    const params = new URLSearchParams();
    if (page) params.append('page', String(page));
    if (limit) params.append('limit', String(limit));
    const { data } = await api.get(`/coupons?${params.toString()}`);
    return data;
  },

  /**
   * Validar cupom pelo codigo
   */
  async validateCoupon(code: string): Promise<CouponValidation> {
    const { data } = await api.get(`/coupons/${code}`);
    return data;
  },

  /**
   * Gerar novo cupom
   */
  async generateCoupon(payload: GenerateCouponPayload): Promise<Coupon> {
    const { data } = await api.post('/coupons/generate', payload);
    return data;
  },

  /**
   * Usar/consumir um cupom
   */
  async useCoupon(id: string): Promise<Coupon> {
    const { data } = await api.post(`/coupons/${id}/use`);
    return data;
  },
};
