import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface DirectionsResult {
  origin: Coordinates;
  destination: Coordinates;
  distanceKm: number;
  durationMinutes: number;
  distanceText: string;
  durationText: string;
  polyline?: string;
  googleMapsUrl: string;
}

@Injectable()
export class GeolocationService {
  private readonly googleMapsApiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.googleMapsApiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY') || '';
  }

  /**
   * Calcula a distancia entre dois pontos usando formula de Haversine
   */
  calculateDistance(origin: Coordinates, destination: Coordinates): number {
    const R = 6371; // Raio da Terra em km
    const dLat = this.toRadians(destination.lat - origin.lat);
    const dLng = this.toRadians(destination.lng - origin.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(origin.lat)) *
        Math.cos(this.toRadians(destination.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100;
  }

  /**
   * Obtendo direcoes via Google Maps Directions API
   * Se a API key nao estiver configurada, retorna calculo local
   */
  async getDirections(
    origin: Coordinates,
    destination: Coordinates,
    mode: string = 'driving',
  ): Promise<DirectionsResult> {
    const distanceKm = this.calculateDistance(origin, destination);

    // Estimativa de tempo baseada na velocidade media
    const speedKmh = this.getSpeedByMode(mode);
    const durationMinutes = Math.ceil((distanceKm / speedKmh) * 60);

    const googleMapsUrl = this.buildGoogleMapsUrl(origin, destination, mode);

    // Se tiver API key, tentar buscar rota real via Google Maps Directions API
    if (this.googleMapsApiKey) {
      try {
        const result = await this.fetchGoogleDirections(origin, destination, mode);
        if (result) {
          return {
            ...result,
            googleMapsUrl,
          };
        }
      } catch {
        // Fallback para calculo local se API falhar
      }
    }

    return {
      origin,
      destination,
      distanceKm,
      durationMinutes,
      distanceText: this.formatDistance(distanceKm),
      durationText: this.formatDuration(durationMinutes),
      googleMapsUrl,
    };
  }

  /**
   * Busca direcoes reais via Google Maps Directions API
   */
  private async fetchGoogleDirections(
    origin: Coordinates,
    destination: Coordinates,
    mode: string,
  ): Promise<Omit<DirectionsResult, 'googleMapsUrl'> | null> {
    const url = new URL('https://maps.googleapis.com/maps/api/directions/json');
    url.searchParams.append('origin', `${origin.lat},${origin.lng}`);
    url.searchParams.append('destination', `${destination.lat},${destination.lng}`);
    url.searchParams.append('mode', mode);
    url.searchParams.append('key', this.googleMapsApiKey);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== 'OK' || !data.routes?.length) {
      return null;
    }

    const route = data.routes[0];
    const leg = route.legs[0];

    return {
      origin,
      destination,
      distanceKm: Math.round((leg.distance.value / 1000) * 100) / 100,
      durationMinutes: Math.ceil(leg.duration.value / 60),
      distanceText: leg.distance.text,
      durationText: leg.duration.text,
      polyline: route.overview_polyline?.points,
    };
  }

  /**
   * Constroi URL do Google Maps para direcoes
   */
  private buildGoogleMapsUrl(origin: Coordinates, destination: Coordinates, mode: string): string {
    const params = new URLSearchParams({
      api: '1',
      origin: `${origin.lat},${origin.lng}`,
      destination: `${destination.lat},${destination.lng}`,
      travelmode: mode,
    });

    return `https://www.google.com/maps/dir/?${params.toString()}`;
  }

  /**
   * Velocidade media por modo de transporte (km/h)
   */
  private getSpeedByMode(mode: string): number {
    switch (mode) {
      case 'walking':
        return 5;
      case 'bicycling':
        return 15;
      case 'transit':
        return 30;
      case 'driving':
      default:
        return 40;
    }
  }

  /**
   * Formata distancia para exibicao
   */
  private formatDistance(km: number): string {
    if (km < 1) {
      return `${Math.round(km * 1000)} m`;
    }
    if (km < 10) {
      return `${km.toFixed(1)} km`;
    }
    return `${Math.round(km)} km`;
  }

  /**
   * Formata duracao para exibicao
   */
  private formatDuration(minutes: number): string {
    if (minutes < 1) return '< 1 min';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;
    if (remaining === 0) return `${hours}h`;
    return `${hours}h ${remaining}min`;
  }

  /**
   * Converte graus para radianos
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
