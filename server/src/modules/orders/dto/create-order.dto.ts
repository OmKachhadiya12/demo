import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty({ example: 'aurora-gold-plated-necklace', description: 'Product ID or slug' })
  @IsString()
  @IsNotEmpty({ message: 'Product ID is required.' })
  productId: string;

  @ApiProperty({ example: 1, minimum: 1, description: 'Purchased quantity' })
  @IsNumber()
  @Min(1, { message: 'Quantity must be at least 1.' })
  quantity: number;

  @ApiPropertyOptional({ example: 'Gold', description: 'Selected color variant' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: 'Standard (16" + 2")', description: 'Selected size variant' })
  @IsOptional()
  @IsString()
  size?: string;
}

export class CustomerDetailsDto {
  @ApiProperty({ example: 'Eleanor Vance', description: 'Customer full name' })
  @IsString()
  @IsNotEmpty({ message: 'Customer full name is required.' })
  fullName: string;

  @ApiProperty({ example: 'eleanor@example.com', description: 'Contact email' })
  @IsEmail({}, { message: 'Valid email address is required.' })
  email: string;

  @ApiProperty({ example: '9876543210', description: 'Phone number for shipment SMS updates' })
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required.' })
  phone: string;
}

export class ShippingAddressDto {
  @ApiProperty({ example: '42 Heritage Boulevard, Colaba', description: 'Street address' })
  @IsString()
  @IsNotEmpty({ message: 'Street address is required.' })
  address: string;

  @ApiProperty({ example: 'Mumbai', description: 'City' })
  @IsString()
  @IsNotEmpty({ message: 'City is required.' })
  city: string;

  @ApiProperty({ example: 'Maharashtra', description: 'State or Province' })
  @IsString()
  @IsNotEmpty({ message: 'State is required.' })
  state: string;

  @ApiProperty({ example: '400001', description: 'Postal or ZIP code' })
  @IsString()
  @IsNotEmpty({ message: 'Postal code is required.' })
  postalCode: string;

  @ApiPropertyOptional({ example: 'India', default: 'India', description: 'Country' })
  @IsOptional()
  @IsString()
  country?: string = 'India';
}

export class CreateOrderDto {
  @ApiProperty({ type: CustomerDetailsDto })
  @ValidateNested()
  @Type(() => CustomerDetailsDto)
  customer: CustomerDetailsDto;

  @ApiProperty({ type: ShippingAddressDto })
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiPropertyOptional({ enum: ['standard', 'express'], default: 'standard' })
  @IsOptional()
  @IsString()
  deliveryOption?: 'standard' | 'express' = 'standard';

  @ApiPropertyOptional({ example: 'SHINE10', description: 'Optional promo code' })
  @IsOptional()
  @IsString()
  promoCode?: string;

  @ApiPropertyOptional({ example: 'card', enum: ['card', 'wallet', 'cod', 'netbanking'] })
  @IsOptional()
  @IsString()
  paymentMethod?: string = 'card';
}
