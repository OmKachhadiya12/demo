import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema.js';
import { Product, ProductDocument } from '../products/schemas/product.schema.js';
import { Cart, CartDocument } from '../cart/schemas/cart.schema.js';
import { DiscountsService } from '../discounts/discounts.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { Payment, PaymentDocument } from '../payments/schemas/payment.schema.js';

@Injectable()
export class OrdersService {
  private readonly FREE_SHIPPING_THRESHOLD = 1999;

  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(Cart.name) private readonly cartModel: Model<CartDocument>,
    @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
    @Inject(DiscountsService) private readonly discountsService: DiscountsService,
  ) {}

  async createOrder(dto: CreateOrderDto, userId?: string | Types.ObjectId) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Cannot create an order with an empty bag.');
    }

    // 1. Re-calculate subtotal and line items from real database product data
    let subtotal = 0;
    const verifiedItems: Array<{
      productId: string;
      name: string;
      price: number;
      quantity: number;
      color: string;
      size: string;
      image: string;
    }> = [];

    for (const item of dto.items) {
      let product: ProductDocument | null = null;
      if (Types.ObjectId.isValid(item.productId)) {
        product = await this.productModel.findById(item.productId).exec();
      }
      if (!product) {
        product = await this.productModel.findOne({ slug: item.productId }).exec();
      }
      if (!product) {
        throw new BadRequestException(`Product with ID '${item.productId}' does not exist.`);
      }

      if (product.availability === 'out-of-stock' || (product.stockQuantity !== undefined && product.stockQuantity < item.quantity)) {
        throw new BadRequestException(
          `Insufficient inventory for "${product.name}". Only ${product.stockQuantity || 0} remaining.`,
        );
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      verifiedItems.push({
        productId: product._id.toString(),
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        color: item.color || product.availableColors?.[0] || 'Gold',
        size: item.size || product.availableSizes?.[0] || 'Standard (16" + 2")',
        image: product.image,
      });
    }

    // 2. Validate promo code & compute discount
    let discount = 0;
    let freeShippingCoupon = false;
    if (dto.promoCode && dto.promoCode.trim()) {
      try {
        const promoRes = await this.discountsService.validateCoupon(dto.promoCode, subtotal);
        if (promoRes.valid) {
          discount = promoRes.discountAmount || 0;
          freeShippingCoupon = Boolean(promoRes.freeShipping);
        }
      } catch (err: any) {
        throw new BadRequestException(err.message || 'Invalid promo code provided.');
      }
    }

    // 3. Shipping & delivery surcharges
    const qualifiesForFreeShipping = subtotal >= this.FREE_SHIPPING_THRESHOLD || freeShippingCoupon;
    const shippingFee = qualifiesForFreeShipping ? 0 : 99;
    const isExpress = dto.deliveryOption === 'express';
    const deliverySurcharge = isExpress ? 199 : 0;

    // 4. Tax (3% GST) & Final Total
    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = Math.round(taxableAmount * 0.03);
    const grandTotal = Math.max(0, taxableAmount + shippingFee + deliverySurcharge + tax);

    // 5. Order IDs & Dates
    const now = new Date();
    const orderId = `LST-${Date.now().toString().slice(-8)}`;

    const deliveryDaysStart = isExpress ? 1 : 3;
    const deliveryDaysEnd = isExpress ? 2 : 5;
    const estStart = new Date(now.getTime() + deliveryDaysStart * 24 * 60 * 60 * 1000);
    const estEnd = new Date(now.getTime() + deliveryDaysEnd * 24 * 60 * 60 * 1000);
    const dateOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const deliveryRange = `${estStart.toLocaleDateString('en-US', dateOpts)} – ${estEnd.toLocaleDateString('en-US', dateOpts)}`;

    const trackingNumber = 'BD-' + Math.floor(100000000 + Math.random() * 900000000);

    // 6. Create & Save Order Document
    const order = new this.orderModel({
      orderId,
      user: userId ? new Types.ObjectId(userId.toString()) : undefined,
      customer: {
        fullName: dto.customer.fullName.trim(),
        email: dto.customer.email.toLowerCase().trim(),
        phone: dto.customer.phone.trim(),
      },
      shippingAddress: {
        address: dto.shippingAddress.address.trim(),
        city: dto.shippingAddress.city.trim(),
        state: dto.shippingAddress.state.trim(),
        postalCode: dto.shippingAddress.postalCode.trim(),
        country: dto.shippingAddress.country?.trim() || 'India',
      },
      items: verifiedItems,
      subtotal,
      discount,
      promoCode: dto.promoCode?.trim().toUpperCase() || undefined,
      shippingFee,
      deliverySurcharge,
      tax,
      total: grandTotal,
      status: 'Confirmed',
      payment: {
        method: dto.paymentMethod || 'card',
        status: 'pending',
        transactionId: dto.paymentMethod === 'cod'
          ? 'COD-' + Math.floor(100000000 + Math.random() * 900000000)
          : undefined,
      },
      carrier: 'Bluedart Air Express',
      trackingNumber,
      estimatedDeliveryDate: deliveryRange,
    });

    await order.save();

    await this.paymentModel.create({
      order: order._id,
      orderId: order.orderId,
      user: order.user,
      amount: order.total,
      currency: 'INR',
      method: order.payment.method,
      status: order.payment.status,
      transactionId: order.payment.transactionId,
      paidAt: order.payment.paidAt,
    });

    // 7. Decrement Inventory in MongoDB
    for (const item of dto.items) {
      const updatedProduct = await this.productModel.findOneAndUpdate(
        { $or: [{ _id: Types.ObjectId.isValid(item.productId) ? item.productId : null }, { slug: item.productId }] },
        { $inc: { stockQuantity: -item.quantity } },
        { returnDocument: 'after' },
      );
      if (updatedProduct && (updatedProduct.stockQuantity ?? 0) <= 0) {
        await this.productModel.updateOne(
          { _id: updatedProduct._id },
          { $set: { availability: 'out-of-stock' } },
        );
      }
    }

    // 8. Clear user cart if authenticated
    if (userId) {
      await this.cartModel.updateOne(
        { user: new Types.ObjectId(userId.toString()) },
        { $set: { items: [] } },
      );
    }

    return order;
  }

  async getMyOrders(userId: string | Types.ObjectId): Promise<OrderDocument[]> {
    return this.orderModel
      .find({ user: new Types.ObjectId(userId.toString()) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getOrderById(orderId: string): Promise<OrderDocument> {
    const trimmedId = (orderId || '').trim();
    let order = await this.orderModel
      .findOne({ orderId: new RegExp(`^${trimmedId}$`, 'i') })
      .exec();

    if (!order && Types.ObjectId.isValid(trimmedId)) {
      order = await this.orderModel.findById(trimmedId).exec();
    }

    if (!order) {
      throw new NotFoundException(`Order with identifier '${orderId}' was not found.`);
    }

    return order;
  }

  async trackOrder(orderNumber: string, email: string): Promise<OrderDocument> {
    const trimmedOrder = (orderNumber || '').trim();
    const trimmedEmail = (email || '').toLowerCase().trim();

    if (!trimmedOrder || !trimmedEmail) {
      throw new BadRequestException('Order number and customer email address are both required.');
    }

    const orderQuery: any = {
      'customer.email': trimmedEmail,
      $or: [
        { orderId: new RegExp(`^${trimmedOrder}$`, 'i') },
        { orderId: new RegExp(`^LST-${trimmedOrder}$`, 'i') },
      ],
    };

    if (Types.ObjectId.isValid(trimmedOrder)) {
      orderQuery.$or.push({ _id: new Types.ObjectId(trimmedOrder) });
    }

    const order = await this.orderModel.findOne(orderQuery).exec();

    if (!order) {
      throw new NotFoundException(
        'No order found matching the provided order number and email address.',
      );
    }

    return order;
  }
}
