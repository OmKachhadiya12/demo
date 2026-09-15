import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: String, required: true, unique: true, index: true })
  orderId: string; // e.g. 'LST-89421056'

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  user?: Types.ObjectId;

  @Prop({ type: Object, required: true })
  customer: {
    fullName: string;
    email: string;
    phone: string;
  };

  @Prop({ type: Object, required: true })
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  @Prop({ type: [Object], required: true })
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    color: string;
    size: string;
    image: string;
  }>;

  @Prop({ type: Number, required: true }) subtotal: number;
  @Prop({ type: Number, default: 0 }) discount: number;
  @Prop({ type: String }) promoCode?: string;
  @Prop({ type: Number, default: 0 }) shippingFee: number;
  @Prop({ type: Number, default: 0 }) deliverySurcharge: number;
  @Prop({ type: Number, default: 0 }) tax: number;
  @Prop({ type: Number, required: true }) total: number;

  @Prop({
    type: String,
    default: 'Confirmed',
    enum: ['Confirmed', 'Processing', 'In Transit', 'Delivered', 'Cancelled'],
  })
  status: string;

  @Prop({ type: Object, default: { method: 'card', status: 'pending' } })
  payment: {
    method: string;
    status: string;
    transactionId?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    paidAt?: Date;
  };

  @Prop({ type: String, default: 'Bluedart Air Express' }) carrier: string;
  @Prop({ type: String }) trackingNumber?: string;
  @Prop({ type: String }) estimatedDeliveryDate: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
