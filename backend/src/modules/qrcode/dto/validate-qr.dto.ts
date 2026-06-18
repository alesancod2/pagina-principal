import { IsString, IsOptional } from 'class-validator';

export class ValidateQrDto {
  @IsString()
  qrPayload: string;

  @IsString()
  partnerSessionId: string;

  @IsOptional()
  @IsString()
  deviceInfo?: string;
}
