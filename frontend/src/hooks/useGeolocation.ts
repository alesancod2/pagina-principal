import { useState, useEffect, useCallback, useRef } from 'react';

export interface GeolocationPosition {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

export interface GeolocationState {
  position: GeolocationPosition | null;
  loading: boolean;
  error: string | null;
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unavailable';
}

export interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  autoRefresh?: boolean;
  refreshInterval?: number; // em milissegundos
}

const DEFAULT_OPTIONS: UseGeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 60000,
  autoRefresh: false,
  refreshInterval: 30000, // 30 segundos
};

/**
 * Hook customizado para obter a posicao do usuario via navigator.geolocation
 * Gerencia permissoes, loading, erro e auto-refresh
 */
export function useGeolocation(options?: UseGeolocationOptions) {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const watchId = useRef<number | null>(null);
  const intervalId = useRef<NodeJS.Timeout | null>(null);

  const [state, setState] = useState<GeolocationState>({
    position: null,
    loading: true,
    error: null,
    permissionStatus: 'prompt',
  });

  const getPosition = useCallback((): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalizacao nao suportada pelo navegador.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const position: GeolocationPosition = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp,
          };
          resolve(position);
        },
        (err) => {
          reject(err);
        },
        {
          enableHighAccuracy: config.enableHighAccuracy,
          timeout: config.timeout,
          maximumAge: config.maximumAge,
        },
      );
    });
  }, [config.enableHighAccuracy, config.timeout, config.maximumAge]);

  const requestPosition = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const position = await getPosition();
      setState({
        position,
        loading: false,
        error: null,
        permissionStatus: 'granted',
      });
      return position;
    } catch (err: any) {
      let errorMessage = 'Erro ao obter localizacao.';
      let permissionStatus: GeolocationState['permissionStatus'] = 'prompt';

      switch (err.code) {
        case 1: // PERMISSION_DENIED
          errorMessage = 'Permissao de localizacao negada. Ative nas configuracoes do navegador.';
          permissionStatus = 'denied';
          break;
        case 2: // POSITION_UNAVAILABLE
          errorMessage = 'Posicao indisponivel. Verifique se o GPS esta ativado.';
          permissionStatus = 'unavailable';
          break;
        case 3: // TIMEOUT
          errorMessage = 'Tempo esgotado ao obter localizacao.';
          break;
        default:
          errorMessage = err.message || 'Erro desconhecido ao obter localizacao.';
      }

      setState({
        position: null,
        loading: false,
        error: errorMessage,
        permissionStatus,
      });
      return null;
    }
  }, [getPosition]);

  const checkPermission = useCallback(async () => {
    if (!navigator.permissions) return;

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      setState((prev) => ({
        ...prev,
        permissionStatus: result.state as GeolocationState['permissionStatus'],
      }));

      result.addEventListener('change', () => {
        setState((prev) => ({
          ...prev,
          permissionStatus: result.state as GeolocationState['permissionStatus'],
        }));
      });
    } catch {
      // Permissions API nao suportada
    }
  }, []);

  // Obter posicao inicial
  useEffect(() => {
    checkPermission();
    requestPosition();
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (config.autoRefresh && config.refreshInterval) {
      intervalId.current = setInterval(() => {
        requestPosition();
      }, config.refreshInterval);
    }

    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current);
        intervalId.current = null;
      }
    };
  }, [config.autoRefresh, config.refreshInterval, requestPosition]);

  // Cleanup watch
  useEffect(() => {
    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  return {
    ...state,
    refresh: requestPosition,
  };
}
