import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

export class UseBenefitDto {
  @IsUUID()
  @IsNotEmpty()
  benefitId: string;

  @IsUUID()
  @IsNotEmpty()
  partnerId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
