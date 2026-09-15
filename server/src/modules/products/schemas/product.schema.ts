import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ type: String, required: true, unique: true, index: true })
  slug: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true, index: true })
  category: string; // 'necklaces' | 'earrings' | 'rings' | 'bracelets' | 'bangles'

  @Prop({ type: String, default: 'everyday' })
  collectionName: string;

  @Prop({ type: Number, required: true })
  price: number; // e.g. 1499

  @Prop({ type: Number })
  oldPrice?: number; // e.g. 2199

  @Prop({ type: Number, default: 4.9 })
  rating: number;

  @Prop({ type: Number, default: 0 })
  reviews: number;

  @Prop({ type: String })
  badge?: string; // 'Bestseller' | 'New' | 'Sale'

  @Prop({ type: String, default: '18K Gold Plated' })
  finish: string;

  @Prop({ type: String, default: 'Gold-plated brass' })
  material: string;

  @Prop({ type: [String], default: ['Gold'] })
  availableColors: string[];

  @Prop({ type: [String], default: ['Standard (16" + 2")'] })
  availableSizes: string[];

  @Prop({ type: String, default: 'in-stock' })
  availability: string;

  @Prop({ type: Number, default: 50 })
  stockQuantity: number;

  @Prop({ type: String, required: true })
  image: string;

  @Prop({ type: [String], default: [] })
  gallery: string[];

  @Prop({ type: String })
  description?: string;

  @Prop({ type: [String], default: [] })
  details: string[];

  @Prop({ type: [String], default: [] })
  care: string[];

  @Prop({ type: [String], default: [] })
  shipping: string[];

  @Prop({ type: [String], default: [] })
  returns: string[];

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: [Object], default: [] })
  customerReviews: Array<{
    id?: string;
    author: string;
    rating: number;
    date: string;
    verified: boolean;
    title: string;
    comment: string;
  }>;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
