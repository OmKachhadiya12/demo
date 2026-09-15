import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminCreateDiscountDto {
  @ApiProperty({ example: 'DIWALI25', description: 'Promo code string' })
  @IsString()
  @IsNotEmpty({ message: 'Coupon code is required.' })
  code: string;

  @ApiProperty({
    example: 'percentage',
    enum: ['percentage', 'fixed', 'free_shipping'],
  })
  @IsString()
  @IsIn(['percentage', 'fixed', 'free_shipping'], {
    message: 'Type must be percentage, fixed, or free_shipping.',
  })
  type: string;

  @ApiProperty({
    example: 0.25,
    description: 'Discount value: 0.25 for 25% percentage, or 250 for ₹250 fixed off',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Discount value must be at least 0.' })
  value: number;

  @ApiPropertyOptional({ example: 1999, default: 0, description: 'Minimum order amount in INR' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minOrderAmount?: number = 0;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  isActive?: boolean = true;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59.999Z', description: 'Expiry date' })
  @IsOptional()
  @IsString()
  expiresAt?: string;
}
