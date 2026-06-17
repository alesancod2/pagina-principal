import api from './api';

// ===================== INTERFACES =====================

export interface WalletInfo {
  balance: number;
  totalEarned: number;
  totalRedeemed: number;
  totalExpired: number;
}

export interface PointTransaction {
  id: string;
  userId: string;
  partnerId: string | null;
  type: 'earned' | 'redeemed' | 'expired' | 'bonus' | 'adjustment';
  amount: number;
  balanceAfter: number;
  description: string | null;
  expiresAt: string | null;
  createdAt: string;
  partner?: {
    id: string;
    companyName: string;
    tradeName: string;
    logoUrl: string;
  };
}

export interface ExpiringPoints {
  expiringPoints: number;
  expiringDate: string;
  transactions: PointTransaction[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RedeemPayload {
  amount: number;
  description?: string;
}

// ===================== SERVICE =====================

export const pointsService = {
  /**
   * Buscar carteira/saldo de pontos
   */
  async getWallet(): Promise<WalletInfo> {
    const { data } = await api.get('/points/wallet');
    return data;
  },

  /**
   * Buscar historico de transacoes de pontos
   */
  async getHistory(page?: number, limit?: number): Promise<PaginatedResponse<PointTransaction>> {
    const params = new URLSearchParams();
    if (page) params.append('page', String(page));
    if (limit) params.append('limit', String(limit));
    const { data } = await api.get(`/points/history?${params.toString()}`);
    return data;
  },

  /**
   * Resgatar pontos
   */
  async redeemPoints(payload: RedeemPayload): Promise<PointTransaction> {
    const { data } = await api.post('/points/redeem', payload);
    return data;
  },

  /**
   * Buscar pontos prestes a expirar
   */
  async getExpiring(): Promise<ExpiringPoints> {
    const { data } = await api.get('/points/expiring');
    return data;
  },
};
