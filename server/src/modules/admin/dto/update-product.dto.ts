import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AdminUpdateProductDto {
  @ApiPropertyOptional({ example: 'Celeste Pearl Drop Earrings' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'earrings' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'bridal' })
  @IsOptional()
  @IsString()
  collectionName?: string;

  @ApiPropertyOptional({ example: 1299 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 1999 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  oldPrice?: number;

  @ApiPropertyOptional({ example: 35 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stockQuantity?: number;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/...' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gallery?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '18K Gold Plated' })
  @IsOptional()
  @IsString()
  finish?: string;

  @ApiPropertyOptional({ example: 'Gold-plated brass' })
  @IsOptional()
  @IsString()
  material?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableColors?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableSizes?: string[];

  @ApiPropertyOptional({ example: 'Bestseller' })
  @IsOptional()
  @IsString()
  badge?: string;

  @ApiPropertyOptional({ example: 'in-stock', enum: ['in-stock', 'out-of-stock'] })
  @IsOptional()
  @IsString()
  availability?: string;
}
