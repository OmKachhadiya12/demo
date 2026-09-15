import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterProductsDto {
  @ApiPropertyOptional({ example: 'necklaces', description: 'Filter by category (necklaces, earrings, rings, bracelets, bangles)' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'everyday', description: 'Filter by collection (everyday, bridal, sale)' })
  @IsOptional()
  @IsString()
  collection?: string;

  @ApiPropertyOptional({ example: '18K Gold Plated', description: 'Filter by jewelry finish' })
  @IsOptional()
  @IsString()
  finish?: string;

  @ApiPropertyOptional({ example: 500, description: 'Minimum price in INR' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional({ example: 3000, description: 'Maximum price in INR' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional({
    enum: ['price-asc', 'price-desc', 'rating', 'newest', 'popular'],
    description: 'Sort order',
  })
  @IsOptional()
  @IsString()
  sort?: 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'popular';

  @ApiPropertyOptional({ example: 'aurora', description: 'Search keywords matching title, description or tags' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 1, default: 1, description: 'Pagination page number' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ example: 12, default: 12, description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 12;
}
