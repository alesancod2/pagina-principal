import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pointsService, RedeemPayload } from '../services/points.service';

/**
 * Hook para buscar saldo/carteira de pontos
 */
export function useWallet() {
  return useQuery({
    queryKey: ['points', 'wallet'],
    queryFn: () => pointsService.getWallet(),
    staleTime: 1 * 60 * 1000, // 1 min
  });
}

/**
 * Hook para buscar historico de transacoes de pontos
 */
export function usePointsHistory(page?: number, limit?: number) {
  return useQuery({
    queryKey: ['points', 'history', page, limit],
    queryFn: () => pointsService.getHistory(page, limit),
    staleTime: 30 * 1000, // 30 seg
  });
}

/**
 * Hook para resgatar pontos
 */
export function useRedeemPoints() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RedeemPayload) => pointsService.redeemPoints(payload),
    onSuccess: () => {
      // Invalidar wallet e historico apos resgate
      queryClient.invalidateQueries({ queryKey: ['points', 'wallet'] });
      queryClient.invalidateQueries({ queryKey: ['points', 'history'] });
      queryClient.invalidateQueries({ queryKey: ['points', 'expiring'] });
    },
  });
}

/**
 * Hook para buscar pontos prestes a expirar
 */
export function useExpiringPoints() {
  return useQuery({
    queryKey: ['points', 'expiring'],
    queryFn: () => pointsService.getExpiring(),
    staleTime: 5 * 60 * 1000, // 5 min
  });
}
