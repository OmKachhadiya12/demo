import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOrderStatusDto {
  @ApiProperty({
    example: 'In Transit',
    enum: ['Confirmed', 'Processing', 'In Transit', 'Delivered', 'Cancelled'],
    description: 'Target workflow status for order',
  })
  @IsString()
  @IsNotEmpty({ message: 'Status is required.' })
  @IsIn(['Confirmed', 'Processing', 'In Transit', 'Delivered', 'Cancelled', 'Shipped'], {
    message: 'Status must be Confirmed, Processing, In Transit, Shipped, Delivered, or Cancelled.',
  })
  status: string;

  @ApiPropertyOptional({
    example: 'BD-991823741',
    description: 'Shipment tracking number for carrier',
  })
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @ApiPropertyOptional({
    example: 'Bluedart Air Express',
    description: 'Logistics carrier name',
  })
  @IsOptional()
  @IsString()
  carrier?: string;
}
