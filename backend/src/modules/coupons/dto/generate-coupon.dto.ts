import {
  IsUUID,
  IsNotEmpty,
} from 'class-validator';

export class GenerateCouponDto {
  @IsUUID()
  @IsNotEmpty()
  benefitId: string;

  @IsUUID()
  @IsNotEmpty()
  partnerId: string;
}
