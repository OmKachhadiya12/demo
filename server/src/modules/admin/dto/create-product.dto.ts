import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminCreateProductDto {
  @ApiProperty({ example: 'Celeste Pearl Drop Earrings', description: 'Product title' })
  @IsString()
  @IsNotEmpty({ message: 'Product name is required.' })
  name: string;

  @ApiProperty({
    example: 'earrings',
    description: 'Category: necklaces, earrings, rings, bracelets, bangles',
  })
  @IsString()
  @IsNotEmpty({ message: 'Category is required.' })
  category: string;

  @ApiPropertyOptional({ example: 'bridal', default: 'everyday' })
  @IsOptional()
  @IsString()
  collectionName?: string = 'everyday';

  @ApiProperty({ example: 1499, description: 'Selling price in INR' })
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Price cannot be negative.' })
  price: number;

  @ApiPropertyOptional({ example: 2199, description: 'Original MSRP/strikethrough price' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  oldPrice?: number;

  @ApiProperty({ example: 45, default: 50, description: 'Available warehouse stock' })
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Stock cannot be negative.' })
  stockQuantity: number;

  @ApiProperty({
    example: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908',
    description: 'Primary product thumbnail image URL',
  })
  @IsString()
  @IsNotEmpty({ message: 'Primary image URL is required.' })
  image: string;

  @ApiPropertyOptional({ type: [String], description: 'Additional gallery image URLs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gallery?: string[];

  @ApiPropertyOptional({ example: 'Handcrafted luxury 18K gold plated brass piece.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '18K Gold Plated', default: '18K Gold Plated' })
  @IsOptional()
  @IsString()
  finish?: string = '18K Gold Plated';

  @ApiPropertyOptional({ example: 'Gold-plated brass with freshwater pearls' })
  @IsOptional()
  @IsString()
  material?: string = 'Gold-plated brass';

  @ApiPropertyOptional({ example: ['Gold', 'Rose Gold', 'Silver'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableColors?: string[];

  @ApiPropertyOptional({ example: ['Standard (16" + 2")'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableSizes?: string[];

  @ApiPropertyOptional({ example: 'Bestseller', enum: ['Bestseller', 'New Arrival', 'Sale', 'Trending'] })
  @IsOptional()
  @IsString()
  badge?: string;
}
