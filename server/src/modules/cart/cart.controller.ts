import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service.js';
import { AddCartItemDto } from './dto/add-cart-item.dto.js';
import { SyncCartDto } from './dto/sync-cart.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { UserDocument } from '../users/schemas/user.schema.js';

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(@Inject(CartService) private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: "Get current user's shopping bag" })
  @ApiResponse({ status: 200, description: 'Cart retrieved successfully.' })
  async getCart(@CurrentUser() user: UserDocument) {
    return this.cartService.getCart(user._id);
  }

  @Post('sync')
  @ApiOperation({ summary: 'Merge guest localStorage items into user server cart upon login' })
  @ApiResponse({ status: 200, description: 'Cart synchronized successfully.' })
  async syncCart(
    @CurrentUser() user: UserDocument,
    @Body() dto: SyncCartDto,
  ) {
    return this.cartService.syncCart(user._id, dto);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add or update item in shopping bag' })
  @ApiResponse({ status: 200, description: 'Cart item added/updated successfully.' })
  async addItem(
    @CurrentUser() user: UserDocument,
    @Body() dto: AddCartItemDto,
  ) {
    return this.cartService.addItem(user._id, dto);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove an item from shopping bag' })
  @ApiResponse({ status: 200, description: 'Cart item removed successfully.' })
  async removeItem(
    @CurrentUser() user: UserDocument,
    @Param('id') itemId: string,
  ) {
    return this.cartService.removeItem(user._id, itemId);
  }

  @Delete()
  @ApiOperation({ summary: 'Empty shopping bag' })
  @ApiResponse({ status: 200, description: 'Cart cleared successfully.' })
  async clearCart(@CurrentUser() user: UserDocument) {
    return this.cartService.clearCart(user._id);
  }
}
