import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { couponsService, GenerateCouponPayload } from '../services/coupons.service';

/**
 * Hook para listar meus cupons
 */
export function useMyCoupons(page?: number, limit?: number) {
  return useQuery({
    queryKey: ['coupons', 'my', page, limit],
    queryFn: () => couponsService.getMyCoupons(page, limit),
    staleTime: 1 * 60 * 1000, // 1 min
  });
}

/**
 * Hook para validar um cupom pelo codigo
 */
export function useValidateCoupon(code: string | undefined) {
  return useQuery({
    queryKey: ['coupons', 'validate', code],
    queryFn: () => couponsService.validateCoupon(code!),
    enabled: !!code && code.length > 0,
    staleTime: 10 * 1000, // 10 seg (validacao precisa ser recente)
  });
}

/**
 * Hook para gerar um novo cupom
 */
export function useGenerateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GenerateCouponPayload) => couponsService.generateCoupon(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons', 'my'] });
    },
  });
}

/**
 * Hook para usar/consumir um cupom
 */
export function useUseCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => couponsService.useCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['coupons', 'validate'] });
    },
  });
}
