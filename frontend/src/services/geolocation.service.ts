/**
 * Servico de geolocalizacao frontend
 * Calcula distancias, formata km/tempo e gera URLs do Google Maps
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface DistanceResult {
  distanceKm: number;
  distanceFormatted: string;
  estimatedTimeMinutes: number;
  estimatedTimeFormatted: string;
}

const GOOGLE_MAPS_BASE_URL = 'https://www.google.com/maps/dir';
const AVERAGE_SPEED_KMH = 40; // Velocidade media urbana

/**
 * Calcula a distancia entre dois pontos usando a formula de Haversine
 */
export function calculateDistance(origin: Coordinates, destination: Coordinates): number {
  const R = 6371; // Raio da Terra em km
  const dLat = toRadians(destination.lat - origin.lat);
  const dLng = toRadians(destination.lng - origin.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(origin.lat)) *
      Math.cos(toRadians(destination.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // 2 casas decimais
}

/**
 * Converte graus para radianos
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Formata distancia em km para exibicao amigavel
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)} km`;
  }
  return `${Math.round(distanceKm)} km`;
}

/**
 * Estima tempo de deslocamento baseado na distancia
 */
export function estimateTime(distanceKm: number, speedKmh: number = AVERAGE_SPEED_KMH): number {
  return Math.ceil((distanceKm / speedKmh) * 60); // Minutos
}

/**
 * Formata tempo estimado para exibicao
 */
export function formatTime(minutes: number): string {
  if (minutes < 1) {
    return '< 1 min';
  }
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}min`;
}

/**
 * Calcula distancia completa com formatacao
 */
export function getDistanceInfo(origin: Coordinates, destination: Coordinates): DistanceResult {
  const distanceKm = calculateDistance(origin, destination);
  const estimatedTimeMinutes = estimateTime(distanceKm);

  return {
    distanceKm,
    distanceFormatted: formatDistance(distanceKm),
    estimatedTimeMinutes,
    estimatedTimeFormatted: formatTime(estimatedTimeMinutes),
  };
}

/**
 * Gera URL de rota no Google Maps (directions)
 */
export function getGoogleMapsRouteUrl(
  origin: Coordinates,
  destination: Coordinates,
  travelMode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving',
): string {
  const originStr = `${origin.lat},${origin.lng}`;
  const destinationStr = `${destination.lat},${destination.lng}`;

  return `${GOOGLE_MAPS_BASE_URL}/${originStr}/${destinationStr}/@${destinationStr},14z/data=!4m2!4m1!3e${getTravelModeCode(travelMode)}`;
}

/**
 * Gera URL simplificada do Google Maps para abrir em nova aba
 */
export function getGoogleMapsDirectionsUrl(
  origin: Coordinates,
  destination: Coordinates,
  travelMode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving',
): string {
  const params = new URLSearchParams({
    api: '1',
    origin: `${origin.lat},${origin.lng}`,
    destination: `${destination.lat},${destination.lng}`,
    travelmode: travelMode,
  });

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/**
 * Converte travel mode para codigo do Google Maps
 */
function getTravelModeCode(mode: string): number {
  switch (mode) {
    case 'driving':
      return 0;
    case 'bicycling':
      return 1;
    case 'transit':
      return 3;
    case 'walking':
      return 2;
    default:
      return 0;
  }
}

/**
 * Ordena lista de parceiros por distancia a partir de um ponto
 */
export function sortByDistance<T extends { latitude?: number; longitude?: number }>(
  items: T[],
  origin: Coordinates,
): (T & { distance?: number })[] {
  return items
    .map((item) => {
      if (item.latitude && item.longitude) {
        const distance = calculateDistance(origin, {
          lat: item.latitude,
          lng: item.longitude,
        });
        return { ...item, distance };
      }
      return { ...item, distance: undefined };
    })
    .sort((a, b) => {
      if (a.distance === undefined) return 1;
      if (b.distance === undefined) return -1;
      return a.distance - b.distance;
    });
}

export const geolocationService = {
  calculateDistance,
  formatDistance,
  estimateTime,
  formatTime,
  getDistanceInfo,
  getGoogleMapsRouteUrl,
  getGoogleMapsDirectionsUrl,
  sortByDistance,
};
