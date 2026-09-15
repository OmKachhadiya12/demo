import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coupon, CouponDocument } from './schemas/coupon.schema.js';

@Injectable()
export class DiscountsService {
  constructor(
    @InjectModel(Coupon.name) private readonly couponModel: Model<CouponDocument>,
  ) {}

  async validateCoupon(code: string, subtotal: number = 0) {
    const normalized = (code || '').trim().toUpperCase();
    if (!normalized) {
      throw new BadRequestException('Please enter a promo code.');
    }

    const coupon = await this.couponModel.findOne({ code: normalized }).exec();
    if (!coupon || !coupon.isActive) {
      throw new BadRequestException('Invalid or expired promo code. Try SHINE10 or LUSTRE20.');
    }

    if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
      throw new BadRequestException(`Promo code ${coupon.code} has expired.`);
    }

    if (coupon.minOrderAmount && subtotal > 0 && subtotal < coupon.minOrderAmount) {
      throw new BadRequestException(
        `Code ${coupon.code} requires a minimum order subtotal of ₹${coupon.minOrderAmount}.`,
      );
    }

    let discountAmount = 0;
    let label = '';
    const isFreeShipping = coupon.type === 'free_shipping';

    if (coupon.type === 'percentage') {
      discountAmount = Math.round(subtotal * coupon.value);
      label = `${Math.round(coupon.value * 100)}% OFF`;
    } else if (coupon.type === 'fixed') {
      discountAmount = Math.min(subtotal, coupon.value);
      label = `₹${coupon.value} OFF`;
    } else if (isFreeShipping) {
      discountAmount = 0;
      label = 'Free Delivery';
    }

    return {
      valid: true,
      code: coupon.code,
      rate: coupon.value,
      type: coupon.type,
      freeShipping: isFreeShipping,
      discountAmount,
      label,
      message: isFreeShipping
        ? 'Free shipping applied to your order!'
        : `${label} applied successfully!`,
    };
  }
}
