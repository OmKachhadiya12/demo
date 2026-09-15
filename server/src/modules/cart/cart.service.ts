import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema.js';
import { Product, ProductDocument } from '../products/schemas/product.schema.js';
import { AddCartItemDto } from './dto/add-cart-item.dto.js';
import { SyncCartDto } from './dto/sync-cart.dto.js';

@Injectable()
export class CartService {
  private readonly FREE_SHIPPING_THRESHOLD = 1999; // ₹1,999 free delivery threshold

  constructor(
    @InjectModel(Cart.name) private readonly cartModel: Model<CartDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
  ) {}

  private async getOrCreateCart(userId: string | Types.ObjectId): Promise<CartDocument> {
    let cart = await this.cartModel.findOne({ user: userId }).exec();
    if (!cart) {
      cart = new this.cartModel({ user: userId, items: [] });
      await cart.save();
    }
    return cart;
  }

  private formatCart(cart: any) {
    const items = cart.items || [];
    const subtotal = items.reduce((sum: number, item: any) => {
      const price = item.product?.price || 0;
      return sum + price * (item.quantity || 1);
    }, 0);

    const cartCount = items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
    const freeShippingUnlocked = subtotal >= this.FREE_SHIPPING_THRESHOLD;
    const shipping = subtotal === 0 || freeShippingUnlocked ? 0 : 99;
    const remainingForFreeShipping = Math.max(0, this.FREE_SHIPPING_THRESHOLD - subtotal);

    return {
      id: cart._id,
      items: items.map((item: any) => ({
        id: item.id,
        productId: item.product?._id || item.product,
        quantity: item.quantity,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
        product: item.product,
      })),
      cartCount,
      subtotal,
      shipping,
      freeShippingUnlocked,
      remainingForFreeShipping,
      total: subtotal + shipping,
    };
  }

  async getCart(userId: string | Types.ObjectId) {
    const cart = await this.cartModel
      .findOne({ user: userId })
      .populate('items.product')
      .exec();

    if (!cart) {
      const newCart = await this.getOrCreateCart(userId);
      return this.formatCart(newCart);
    }

    return this.formatCart(cart);
  }

  async addItem(userId: string | Types.ObjectId, dto: AddCartItemDto) {
    let product: ProductDocument | null = null;
    if (Types.ObjectId.isValid(dto.productId)) {
      product = await this.productModel.findById(dto.productId).exec();
    }
    if (!product) {
      product = await this.productModel.findOne({ slug: dto.productId }).exec();
    }
    if (!product) {
      throw new NotFoundException(`Product '${dto.productId}' not found.`);
    }

    const selectedColor = dto.selectedColor || product.availableColors?.[0] || 'Gold';
    const selectedSize = dto.selectedSize || product.availableSizes?.[0] || 'Standard (16" + 2")';
    const colorSlug = selectedColor.toLowerCase().replace(/\s+/g, '-');
    const compositeId = `${product.slug}-${colorSlug}`;

    const cart = await this.getOrCreateCart(userId);
    const existingIndex = cart.items.findIndex(
      (item) => item.id === compositeId || item.product.toString() === product._id.toString(),
    );

    const quantityToAdd = dto.quantity && dto.quantity > 0 ? dto.quantity : 1;

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantityToAdd;
      cart.items[existingIndex].selectedColor = selectedColor;
      cart.items[existingIndex].selectedSize = selectedSize;
    } else {
      cart.items.push({
        id: compositeId,
        product: product._id as any,
        quantity: quantityToAdd,
        selectedColor,
        selectedSize,
      } as any);
    }

    await cart.save();
    return this.getCart(userId);
  }

  async syncCart(userId: string | Types.ObjectId, dto: SyncCartDto) {
    if (!dto.items || dto.items.length === 0) {
      return this.getCart(userId);
    }

    for (const item of dto.items) {
      await this.addItem(userId, item);
    }

    return this.getCart(userId);
  }

  async removeItem(userId: string | Types.ObjectId, itemId: string) {
    const cart = await this.getOrCreateCart(userId);
    cart.items = cart.items.filter(
      (item) => item.id !== itemId && item.product.toString() !== itemId,
    );
    await cart.save();
    return this.getCart(userId);
  }

  async clearCart(userId: string | Types.ObjectId) {
    const cart = await this.getOrCreateCart(userId);
    cart.items = [];
    await cart.save();
    return this.getCart(userId);
  }
}
