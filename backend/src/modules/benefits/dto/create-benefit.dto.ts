import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsUUID,
  IsDateString,
  IsInt,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { BenefitType } from '../entities/benefit.entity';

export class CreateBenefitDto {
  @IsUUID()
  @IsNotEmpty()
  partnerId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(BenefitType)
  @IsNotEmpty()
  benefitType: BenefitType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountFixed?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  cashbackPercent?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  pointsGenerated?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  pointsRequired?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxUses?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxUsesPerUser?: number;

  @IsOptional()
  @IsBoolean()
  requiresCompliance?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  daysAvailable?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateBenefitDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(BenefitType)
  benefitType?: BenefitType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountFixed?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  cashbackPercent?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  pointsGenerated?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  pointsRequired?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxUses?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxUsesPerUser?: number;

  @IsOptional()
  @IsBoolean()
  requiresCompliance?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  daysAvailable?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
