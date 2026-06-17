import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  adminService,
  CreatePartnerPayload,
  UpdatePartnerPayload,
  CreateBenefitPayload,
  UpdateBenefitPayload,
  CreateCampaignPayload,
  UpdateCampaignPayload,
} from '../services/admin.service';

// ===================== STATS =====================

/**
 * Hook para indicadores gerais do dashboard admin
 */
export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminService.getStats(),
    staleTime: 30 * 1000, // 30 seg
  });
}

/**
 * Hook para estatisticas mensais
 */
export function useAdminMonthlyStats() {
  return useQuery({
    queryKey: ['admin', 'stats', 'monthly'],
    queryFn: () => adminService.getMonthlyStats(),
    staleTime: 60 * 1000, // 1 min
  });
}

// ===================== PARTNERS =====================

/**
 * Hook para listar parceiros (admin)
 */
export function useAdminPartners(params?: {
  category?: string;
  city?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}) {
  return useQuery({
    queryKey: ['admin', 'partners', params],
    queryFn: () => adminService.getPartners(params),
    staleTime: 30 * 1000,
  });
}

/**
 * Hook para criar parceiro
 */
export function useCreatePartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePartnerPayload) => adminService.createPartner(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'partners'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

/**
 * Hook para atualizar parceiro
 */
export function useUpdatePartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePartnerPayload }) =>
      adminService.updatePartner(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'partners'] });
    },
  });
}

/**
 * Hook para ativar/desativar parceiro
 */
export function useUpdatePartnerStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminService.updatePartnerStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'partners'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

/**
 * Hook para deletar parceiro
 */
export function useDeletePartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.deletePartner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'partners'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

// ===================== BENEFITS =====================

/**
 * Hook para listar beneficios (admin)
 */
export function useAdminBenefits(page?: number, limit?: number) {
  return useQuery({
    queryKey: ['admin', 'benefits', page, limit],
    queryFn: () => adminService.getBenefits(page, limit),
    staleTime: 30 * 1000,
  });
}

/**
 * Hook para criar beneficio
 */
export function useCreateBenefit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBenefitPayload) => adminService.createBenefit(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'benefits'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

/**
 * Hook para atualizar beneficio
 */
export function useUpdateBenefit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateBenefitPayload }) =>
      adminService.updateBenefit(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'benefits'] });
    },
  });
}

// ===================== CAMPAIGNS =====================

/**
 * Hook para listar campanhas (admin)
 */
export function useAdminCampaigns(page?: number, limit?: number) {
  return useQuery({
    queryKey: ['admin', 'campaigns', page, limit],
    queryFn: () => adminService.getCampaigns(page, limit),
    staleTime: 30 * 1000,
  });
}

/**
 * Hook para criar campanha
 */
export function useCreateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCampaignPayload) => adminService.createCampaign(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

/**
 * Hook para atualizar campanha
 */
export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCampaignPayload }) =>
      adminService.updateCampaign(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'campaigns'] });
    },
  });
}

// ===================== MEMBERS =====================

/**
 * Hook para listar membros (admin)
 */
export function useAdminMembers(page?: number, limit?: number) {
  return useQuery({
    queryKey: ['admin', 'members', page, limit],
    queryFn: () => adminService.getMembers(page, limit),
    staleTime: 30 * 1000,
  });
}

// ===================== REPORTS =====================

/**
 * Hook para relatorio de uso
 */
export function useAdminUsageReport(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['admin', 'reports', 'usage', startDate, endDate],
    queryFn: () => adminService.getUsageReport(startDate, endDate),
    staleTime: 60 * 1000,
  });
}

/**
 * Hook para relatorio de pontos
 */
export function useAdminPointsReport() {
  return useQuery({
    queryKey: ['admin', 'reports', 'points'],
    queryFn: () => adminService.getPointsReport(),
    staleTime: 60 * 1000,
  });
}

/**
 * Hook para ranking de parceiros
 */
export function useAdminPartnersRanking() {
  return useQuery({
    queryKey: ['admin', 'reports', 'partners-ranking'],
    queryFn: () => adminService.getPartnersRanking(),
    staleTime: 60 * 1000,
  });
}

/**
 * Hooks consolidados para facil importacao
 */
export function useAdminReports(type: 'usage' | 'points' | 'ranking', params?: {
  startDate?: string;
  endDate?: string;
}) {
  const queryClient = useQueryClient();

  const usageReport = useQuery({
    queryKey: ['admin', 'reports', 'usage', params?.startDate, params?.endDate],
    queryFn: () => adminService.getUsageReport(params?.startDate, params?.endDate),
    enabled: type === 'usage',
    staleTime: 60 * 1000,
  });

  const pointsReport = useQuery({
    queryKey: ['admin', 'reports', 'points'],
    queryFn: () => adminService.getPointsReport(),
    enabled: type === 'points',
    staleTime: 60 * 1000,
  });

  const rankingReport = useQuery({
    queryKey: ['admin', 'reports', 'partners-ranking'],
    queryFn: () => adminService.getPartnersRanking(),
    enabled: type === 'ranking',
    staleTime: 60 * 1000,
  });

  return { usageReport, pointsReport, rankingReport };
}
