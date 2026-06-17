import { useQuery } from '@tanstack/react-query';
import {
  partnersService,
  PartnerFilters,
  NearbyParams,
} from '../services/partners.service';

/**
 * Hook para listar parceiros com filtros e paginacao
 */
export function usePartners(filters?: PartnerFilters) {
  return useQuery({
    queryKey: ['partners', filters],
    queryFn: () => partnersService.getPartners(filters),
    staleTime: 2 * 60 * 1000, // 2 min cache
  });
}

/**
 * Hook para buscar detalhe de um parceiro por ID
 */
export function usePartnerDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['partner', id],
    queryFn: () => partnersService.getPartnerById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 min cache
  });
}

/**
 * Hook para buscar parceiros proximos via geolocalizacao
 */
export function useNearbyPartners(params: NearbyParams | undefined) {
  return useQuery({
    queryKey: ['partners-nearby', params],
    queryFn: () => partnersService.getNearbyPartners(params!),
    enabled: !!params && !!params.lat && !!params.lng,
    staleTime: 1 * 60 * 1000, // 1 min cache
  });
}
