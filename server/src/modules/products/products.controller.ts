import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  Body,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service.js';
import { FilterProductsDto } from './dto/filter-products.dto.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { UserDocument } from '../users/schemas/user.schema.js';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(@Inject(ProductsService) private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get products with category/collection filters, price range, search, and sorting' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully with pagination.' })
  async findAll(@Query() query: FilterProductsDto) {
    return this.productsService.findAll(query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a single product by its URL slug' })
  @ApiResponse({ status: 200, description: 'Product details found.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Get(':id/related')
  @ApiOperation({ summary: 'Get 4 complementary related pieces (You May Also Like & Complete the Look)' })
  @ApiResponse({ status: 200, description: 'Related items found.' })
  async findRelated(@Param('id') id: string) {
    return this.productsService.findRelated(id);
  }

  @Post(':id/reviews')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Submit a verified star review for a product' })
  @ApiResponse({ status: 201, description: 'Review posted and product rating updated.' })
  @ApiResponse({ status: 401, description: 'Unauthorized - sign in required.' })
  async addReview(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
    @Body() dto: CreateReviewDto,
  ) {
    return this.productsService.addReview(id, user, dto);
  }
}
