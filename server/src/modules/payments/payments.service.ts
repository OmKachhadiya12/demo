import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { Order, OrderDocument } from '../orders/schemas/order.schema.js';
import { CreatePaymentIntentDto } from './dto/create-intent.dto.js';
import { VerifyPaymentDto } from './dto/verify-payment.dto.js';
import { CodPaymentDto } from './dto/cod-payment.dto.js';
import { Payment, PaymentDocument } from './schemas/payment.schema.js';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly razorpay: any;
  private readonly keyId: string;
  private readonly keySecret: string;

  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {
    this.keyId =
      this.configService.get<string>('RAZORPAY_KEY_ID') || 'rzp_test_lustre2026';
    this.keySecret =
      this.configService.get<string>('RAZORPAY_KEY_SECRET') ||
      'lustre_secret_key_mock_9999';

    try {
      this.razorpay = new Razorpay({
        key_id: this.keyId,
        key_secret: this.keySecret,
      });
    } catch (err: any) {
      this.logger.warn(`Razorpay client initialized with mock/fallback mode: ${err.message}`);
    }
  }

  getPublicKey() {
    return {
      keyId: this.keyId,
      currency: 'INR',
    };
  }

  async createPaymentIntent(dto: CreatePaymentIntentDto) {
    const order = await this.orderModel
      .findOne({ orderId: new RegExp(`^${dto.orderId.trim()}$`, 'i') })
      .exec();

    if (!order) {
      throw new NotFoundException(`Order '${dto.orderId}' was not found.`);
    }

    if (order.payment?.status === 'paid') {
      throw new BadRequestException(
        `Order '${order.orderId}' has already been paid successfully.`,
      );
    }

    // Tamper-proof amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(order.total * 100);
    if (amountInPaise <= 0) {
      throw new BadRequestException('Order amount must be greater than zero.');
    }

    let razorpayOrderId: string;

    // Use live Razorpay API if valid API keys configured, else safe dev mode fallback
    const isMockKey =
      !this.keyId ||
      this.keyId.includes('test_lustre2026') ||
      this.keyId === 'rzp_test_placeholder';

    if (!isMockKey && this.razorpay) {
      try {
        const rzpOrder = await this.razorpay.orders.create({
          amount: amountInPaise,
          currency: dto.currency || 'INR',
          receipt: order.orderId,
          notes: {
            orderId: order.orderId,
            customerEmail: order.customer?.email || '',
          },
        });
        razorpayOrderId = rzpOrder.id;
      } catch (err: any) {
        this.logger.warn(
          `Razorpay live API order creation failed (${err.message}). Falling back to development session.`,
        );
        razorpayOrderId = 'order_' + crypto.randomBytes(10).toString('hex');
      }
    } else {
      razorpayOrderId = 'order_' + crypto.randomBytes(10).toString('hex');
    }

    // Persist razorpay session details on order
    order.payment = {
      ...order.payment,
      method: 'razorpay',
      status: 'pending',
      razorpayOrderId,
    };
    await order.save();
    await this.paymentModel.findOneAndUpdate(
      { orderId: order.orderId },
      {
        order: order._id,
        user: order.user,
        amount: order.total,
        currency: dto.currency || 'INR',
        method: 'razorpay',
        status: 'pending',
        razorpayOrderId,
      },
      { upsert: true, returnDocument: 'after' },
    );

    return {
      success: true,
      orderId: order.orderId,
      razorpayOrderId,
      amount: amountInPaise,
      currency: dto.currency || 'INR',
      keyId: this.keyId,
      customer: {
        name: order.customer?.fullName,
        email: order.customer?.email,
        phone: order.customer?.phone,
      },
      notes: {
        orderId: order.orderId,
      },
    };
  }

  async verifyPayment(dto: VerifyPaymentDto) {
    const text = `${dto.razorpayOrderId}|${dto.razorpayPaymentId}`;
    const generatedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(text)
      .digest('hex');

    const isValid = generatedSignature === dto.razorpaySignature;
    if (!isValid) {
      throw new BadRequestException(
        'Payment signature verification failed. Invalid cryptographic signature.',
      );
    }

    const order = await this.orderModel
      .findOne({
        $or: [
          { orderId: new RegExp(`^${dto.orderId.trim()}$`, 'i') },
          { 'payment.razorpayOrderId': dto.razorpayOrderId },
        ],
      })
      .exec();

    if (!order) {
      throw new NotFoundException(
        `Order '${dto.orderId}' not found for payment verification.`,
      );
    }

    // Mark payment status = 'paid' and record audit metadata
    order.payment = {
      ...order.payment,
      method: 'razorpay',
      status: 'paid',
      transactionId: dto.razorpayPaymentId,
      razorpayOrderId: dto.razorpayOrderId,
      razorpayPaymentId: dto.razorpayPaymentId,
      razorpaySignature: dto.razorpaySignature,
      paidAt: new Date(),
    };
    order.status = 'Confirmed';
    await order.save();
    await this.paymentModel.findOneAndUpdate(
      { orderId: order.orderId },
      {
        order: order._id,
        user: order.user,
        amount: order.total,
        currency: 'INR',
        method: 'razorpay',
        status: 'paid',
        transactionId: dto.razorpayPaymentId,
        razorpayOrderId: dto.razorpayOrderId,
        razorpayPaymentId: dto.razorpayPaymentId,
        razorpaySignature: dto.razorpaySignature,
        paidAt: order.payment.paidAt,
      },
      { upsert: true, returnDocument: 'after' },
    );

    return {
      success: true,
      message: 'Payment verified and captured successfully.',
      orderId: order.orderId,
      paymentStatus: 'paid',
      transactionId: dto.razorpayPaymentId,
      order,
    };
  }

  async confirmCodPayment(dto: CodPaymentDto) {
    const order = await this.orderModel
      .findOne({ orderId: new RegExp(`^${dto.orderId.trim()}$`, 'i') })
      .exec();

    if (!order) {
      throw new NotFoundException(`Order '${dto.orderId}' was not found.`);
    }

    order.payment = {
      ...order.payment,
      method: 'cod',
      status: 'pending',
      transactionId:
        order.payment?.transactionId ||
        'COD-' + Math.floor(100000000 + Math.random() * 900000000),
    };
    order.status = 'Confirmed';
    await order.save();
    await this.paymentModel.findOneAndUpdate(
      { orderId: order.orderId },
      {
        order: order._id,
        user: order.user,
        amount: order.total,
        currency: 'INR',
        method: 'cod',
        status: 'pending',
        transactionId: order.payment.transactionId,
      },
      { upsert: true, returnDocument: 'after' },
    );

    return {
      success: true,
      message:
        'Cash on Delivery selected. Payment will be collected upon shipment delivery.',
      orderId: order.orderId,
      paymentStatus: 'pending',
      order,
    };
  }
}
