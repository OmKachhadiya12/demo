import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Inject,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { UserDocument } from '../users/schemas/user.schema.js';
import { JwtService } from '@nestjs/jwt';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(
    @Inject(OrdersService) private readonly ordersService: OrdersService,
    @Inject(JwtService) private readonly jwtService: JwtService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Place a new jewelry order (guest or authenticated)' })
  @ApiResponse({ status: 201, description: 'Order placed with tamper-proof recalculation.' })
  @ApiResponse({ status: 400, description: 'Empty cart or invalid item inventory.' })
  async createOrder(@Body() dto: CreateOrderDto, @Req() req: any) {
    let userId: string | undefined;
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const payload = this.jwtService.decode(token) as any;
        if (payload && payload.sub) {
          userId = payload.sub;
        }
      } catch {
        // Treat as guest checkout if token parsing fails
      }
    }

    return this.ordersService.createOrder(dto, userId);
  }

  @Get('my-orders')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List past orders for authenticated customer dashboard' })
  @ApiResponse({ status: 200, description: 'List of past customer orders.' })
  async getMyOrders(@CurrentUser() user: UserDocument) {
    return this.ordersService.getMyOrders(user._id);
  }

  @Get('track')
  @ApiOperation({ summary: 'Public order tracking lookup by Order ID and Customer Email' })
  @ApiQuery({ name: 'orderId', example: 'LST-89421056' })
  @ApiQuery({ name: 'email', example: 'eleanor@example.com' })
  @ApiResponse({ status: 200, description: 'Order tracking stage and carrier info.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async trackOrder(
    @Query('orderId') orderId: string,
    @Query('email') email: string,
  ) {
    return this.ordersService.trackOrder(orderId, email);
  }

  @Get(':orderId')
  @ApiOperation({ summary: 'Get full details of an order for confirmation or display' })
  @ApiResponse({ status: 200, description: 'Order details found.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async getOrderById(@Param('orderId') orderId: string) {
    return this.ordersService.getOrderById(orderId);
  }
}
