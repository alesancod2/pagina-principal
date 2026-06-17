import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { partnersService, UseBenefitPayload } from '../services/partners.service';

/**
 * Hook para listar beneficios (todos ou por parceiro)
 */
export function useBenefits(partnerId?: string, page?: number, limit?: number) {
  return useQuery({
    queryKey: ['benefits', partnerId, page, limit],
    queryFn: () => partnersService.getBenefits(partnerId, page, limit),
    staleTime: 2 * 60 * 1000, // 2 min cache
  });
}

/**
 * Hook para buscar detalhe de um beneficio
 */
export function useBenefitDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['benefit', id],
    queryFn: () => partnersService.getBenefitById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 min cache
  });
}

/**
 * Hook para utilizar um beneficio (mutation)
 */
export function useUseBenefit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UseBenefitPayload }) =>
      partnersService.useBenefit(id, payload),
    onSuccess: () => {
      // Invalidar caches relacionados
      queryClient.invalidateQueries({ queryKey: ['benefits'] });
      queryClient.invalidateQueries({ queryKey: ['benefit-history'] });
    },
  });
}

/**
 * Hook para historico de uso de beneficios do usuario
 */
export function useBenefitHistory(page?: number, limit?: number) {
  return useQuery({
    queryKey: ['benefit-history', page, limit],
    queryFn: () => partnersService.getMyBenefitHistory(page, limit),
    staleTime: 1 * 60 * 1000, // 1 min cache
  });
}
