import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CouponDocument = Coupon & Document;

@Schema({ timestamps: true })
export class Coupon {
  @Prop({ type: String, required: true, unique: true, uppercase: true })
  code: string; // 'SHINE10', 'LUSTRE20', 'FREESHIP'

  @Prop({ type: String, required: true, enum: ['percentage', 'fixed', 'free_shipping'] })
  type: string;

  @Prop({ type: Number, required: true })
  value: number; // 0.10 for 10%

  @Prop({ type: Number, default: 0 })
  minOrderAmount: number;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Date, required: false })
  expiresAt?: Date;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
