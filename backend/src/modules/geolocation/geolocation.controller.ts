import {
  Controller,
  Get,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { GeolocationService, DirectionsResult } from './geolocation.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('geolocation')
export class GeolocationController {
  constructor(private readonly geolocationService: GeolocationService) {}

  /**
   * GET /geolocation/directions?origin=-23.5505,-46.6333&destination=-23.5615,-46.6559&mode=driving
   * Retorna direcoes entre dois pontos
   */
  @Get('directions')
  @UseGuards(JwtAuthGuard)
  async getDirections(
    @Query('origin') origin: string,
    @Query('destination') destination: string,
    @Query('mode') mode?: string,
  ): Promise<DirectionsResult> {
    if (!origin || !destination) {
      throw new BadRequestException('Parametros "origin" e "destination" sao obrigatorios.');
    }

    const originCoords = this.parseCoordinates(origin);
    const destinationCoords = this.parseCoordinates(destination);

    if (!originCoords || !destinationCoords) {
      throw new BadRequestException(
        'Formato invalido. Use "lat,lng" (ex: -23.5505,-46.6333).',
      );
    }

    const validModes = ['driving', 'walking', 'bicycling', 'transit'];
    const travelMode = validModes.includes(mode || '') ? mode! : 'driving';

    return this.geolocationService.getDirections(
      originCoords,
      destinationCoords,
      travelMode,
    );
  }

  /**
   * GET /geolocation/distance?origin=-23.5505,-46.6333&destination=-23.5615,-46.6559
   * Retorna apenas a distancia entre dois pontos
   */
  @Get('distance')
  @UseGuards(JwtAuthGuard)
  async getDistance(
    @Query('origin') origin: string,
    @Query('destination') destination: string,
  ) {
    if (!origin || !destination) {
      throw new BadRequestException('Parametros "origin" e "destination" sao obrigatorios.');
    }

    const originCoords = this.parseCoordinates(origin);
    const destinationCoords = this.parseCoordinates(destination);

    if (!originCoords || !destinationCoords) {
      throw new BadRequestException(
        'Formato invalido. Use "lat,lng" (ex: -23.5505,-46.6333).',
      );
    }

    const distanceKm = this.geolocationService.calculateDistance(originCoords, destinationCoords);

    return {
      origin: originCoords,
      destination: destinationCoords,
      distanceKm,
    };
  }

  /**
   * Parse string "lat,lng" para objeto Coordinates
   */
  private parseCoordinates(coordStr: string): { lat: number; lng: number } | null {
    const parts = coordStr.split(',').map((p) => p.trim());
    if (parts.length !== 2) return null;

    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);

    if (isNaN(lat) || isNaN(lng)) return null;
    if (lat < -90 || lat > 90) return null;
    if (lng < -180 || lng > 180) return null;

    return { lat, lng };
  }
}
