import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Inject,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AdminService } from './admin.service.js';
import { AdminCreateProductDto } from './dto/create-product.dto.js';
import { AdminUpdateProductDto } from './dto/update-product.dto.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { AdminCreateDiscountDto } from './dto/create-discount.dto.js';
import { AdminFilterOrdersDto } from './dto/filter-orders.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(
    @Inject(AdminService) private readonly adminService: AdminService,
  ) {}

  @Get('dashboard')
  @ApiOperation({
    summary:
      'Store analytics: total revenue, total orders, average order value, customer count, low stock alerts, and sales trend',
  })
  @ApiResponse({ status: 200, description: 'Dashboard metrics computed.' })
  async getDashboard() {
    return this.adminService.getDashboardMetrics();
  }

  @Post('products')
  @ApiOperation({ summary: 'Create a new catalog jewelry piece' })
  @ApiResponse({ status: 201, description: 'Product created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid product attributes.' })
  async createProduct(@Body() dto: AdminCreateProductDto) {
    return this.adminService.createProduct(dto);
  }

  @Put('products/:id')
  @ApiOperation({ summary: 'Update price, stock, images, or availability for product' })
  @ApiParam({ name: 'id', description: 'Product slug or MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Product updated successfully.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async updateProduct(
    @Param('id') id: string,
    @Body() dto: AdminUpdateProductDto,
  ) {
    return this.adminService.updateProduct(id, dto);
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'Delete or archive product from catalog' })
  @ApiParam({ name: 'id', description: 'Product slug or MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async deleteProduct(@Param('id') id: string) {
    return this.adminService.deleteProduct(id);
  }

  @Get('orders')
  @ApiOperation({ summary: 'List customer orders with status filter, search, and pagination' })
  @ApiResponse({ status: 200, description: 'Filtered orders retrieved.' })
  async getOrders(@Query() dto: AdminFilterOrdersDto) {
    return this.adminService.getOrders(dto);
  }

  @Patch('orders/:id/status')
  @ApiOperation({
    summary:
      'Transition order status in lifecycle: Processing → In Transit → Delivered',
  })
  @ApiParam({ name: 'id', description: 'Order ID (e.g. LST-89421056) or ObjectId' })
  @ApiResponse({ status: 200, description: 'Order status transitioned successfully.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.adminService.updateOrderStatus(id, dto);
  }

  @Post('discounts')
  @ApiOperation({ summary: 'Create new promotional coupon code' })
  @ApiResponse({ status: 201, description: 'Coupon created successfully.' })
  @ApiResponse({ status: 409, description: 'Coupon code already exists.' })
  async createDiscount(@Body() dto: AdminCreateDiscountDto) {
    return this.adminService.createDiscount(dto);
  }

  @Get('discounts')
  @ApiOperation({ summary: 'List all promotional discounts' })
  @ApiResponse({ status: 200, description: 'List of promo codes retrieved.' })
  async getDiscounts() {
    return this.adminService.getDiscounts();
  }

  @Delete('discounts/:id')
  @ApiOperation({ summary: 'Remove a promotional coupon code' })
  @ApiParam({ name: 'id', description: 'Coupon code or MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Coupon removed successfully.' })
  @ApiResponse({ status: 404, description: 'Coupon not found.' })
  async deleteDiscount(@Param('id') id: string) {
    return this.adminService.deleteDiscount(id);
  }
}
