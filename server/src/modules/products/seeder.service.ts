import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema.js';
import { Coupon, CouponDocument } from '../discounts/schemas/coupon.schema.js';
import { User, UserDocument } from '../users/schemas/user.schema.js';
import { Order, OrderDocument } from '../orders/schemas/order.schema.js';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(Coupon.name) private readonly couponModel: Model<CouponDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
  ) {}

  async seed(productsData: any[]) {
    this.logger.log('🌱 Starting database seeding to MongoDB Atlas...');

    // 1. Seed Products (19 pieces)
    if (productsData && productsData.length > 0) {
      let count = 0;
      for (const item of productsData) {
        const productPayload = {
          slug: item.slug,
          name: item.name,
          category: item.category,
          collectionName: item.collection || item.collectionName || 'everyday',
          price: item.price,
          oldPrice: item.oldPrice,
          rating: item.rating || 4.9,
          reviews: item.reviews || 0,
          badge: item.badge,
          finish: item.finish || '18K Gold Plated',
          material: item.material || 'Gold-plated brass',
          availableColors: item.availableColors || (item.color ? [item.color] : ['Gold']),
          availableSizes: item.availableSizes || ['Standard (16" + 2")'],
          availability: item.availability || 'in-stock',
          stockQuantity: item.stockQuantity || 50,
          image: item.image,
          gallery: item.gallery || [item.image],
          description: item.description,
          details: item.details || [],
          care: item.care || [],
          shipping: item.shipping || [],
          returns: item.returns || [],
          tags: item.tags || [],
          customerReviews: item.customerReviews || [],
        };

        await this.productModel.findOneAndUpdate(
          { slug: item.slug },
          productPayload,
          { upsert: true, returnDocument: 'after' },
        );
        count++;
      }
      this.logger.log(`✅ Upserted ${count} luxury jewelry pieces into Atlas.`);
    }

    // 2. Seed Default Promotional Coupons
    const defaultCoupons = [
      { code: 'SHINE10', type: 'percentage', value: 0.1, minOrderAmount: 0, isActive: true },
      { code: 'LUSTRE20', type: 'percentage', value: 0.2, minOrderAmount: 1999, isActive: true },
      { code: 'FREESHIP', type: 'free_shipping', value: 0, minOrderAmount: 0, isActive: true },
      { code: 'BRIDAL25', type: 'percentage', value: 0.25, minOrderAmount: 4999, isActive: true },
    ];

    for (const coupon of defaultCoupons) {
      await this.couponModel.findOneAndUpdate(
        { code: coupon.code },
        coupon,
        { upsert: true, returnDocument: 'after' },
      );
    }
    this.logger.log(`✅ Seeded promotional coupons (SHINE10, LUSTRE20, FREESHIP, BRIDAL25).`);

    // 3. Seed Default Store Administrator
    const adminEmail = 'admin@lustre.com';
    const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
    const adminUser = await this.userModel.findOneAndUpdate(
      { email: adminEmail },
      {
        name: 'Tanvi Shah',
        email: adminEmail,
        password: adminPasswordHash,
        role: 'admin',
        phone: '9876543210',
      },
      { upsert: true, returnDocument: 'after' },
    );
    this.logger.log(`✅ Seeded default admin account (${adminEmail} / Admin@123).`);

    // 4. Seed Demo Customer Account with Saved Addresses
    const customerEmail = 'customer@lustre.com';
    const customerPasswordHash = await bcrypt.hash('Customer@123', 10);
    const customerUser = await this.userModel.findOneAndUpdate(
      { email: customerEmail },
      {
        name: 'Sophia Montgomery',
        email: customerEmail,
        password: customerPasswordHash,
        role: 'customer',
        phone: '+1 (555) 234-5678',
        addresses: [
          {
            fullName: 'Sophia Montgomery',
            phone: '+1 (555) 234-5678',
            address: '742 Evergreen Terrace, Suite 4B',
            city: 'San Francisco',
            state: 'California',
            postalCode: '94107',
            country: 'United States',
            isDefault: true,
          },
          {
            fullName: 'Sophia Montgomery',
            phone: '+91 9876543210',
            address: 'Flat 402, Royal Palms, Bandra West',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400050',
            country: 'India',
            isDefault: false,
          },
        ],
      },
      { upsert: true, returnDocument: 'after' },
    );
    this.logger.log(`✅ Seeded demo customer account (${customerEmail} / Customer@123).`);

    // 5. Seed Sample Realistic Orders
    const sampleOrders = [
      {
        orderId: 'LST-89421056',
        user: customerUser?._id,
        customer: {
          fullName: 'Sophia Montgomery',
          email: customerEmail,
          phone: '+1 (555) 234-5678',
        },
        shippingAddress: {
          address: '742 Evergreen Terrace, Suite 4B',
          city: 'San Francisco',
          state: 'California',
          postalCode: '94107',
          country: 'United States',
        },
        items: [
          {
            productId: 'aurora-gold-plated-necklace',
            name: 'Aurora Gold-Plated Necklace',
            price: 1899,
            quantity: 1,
            color: '18K Gold Plated',
            size: 'Standard (16" + 2")',
            image:
              'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
          },
          {
            productId: 'celestial-pearl-drop-earrings',
            name: 'Celestial Pearl Drop Earrings',
            price: 1499,
            quantity: 1,
            color: 'Pearl / Gold',
            size: 'Standard',
            image:
              'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
          },
        ],
        subtotal: 3398,
        discount: 0,
        shippingFee: 0,
        deliverySurcharge: 0,
        tax: 102,
        total: 3500,
        status: 'In Transit',
        payment: {
          method: 'card',
          status: 'paid',
          transactionId: 'txn_mock_001',
          paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        carrier: 'Bluedart Air Express',
        trackingNumber: 'BD-982144701',
        estimatedDeliveryDate: 'In 2 days',
      },
      {
        orderId: 'LST-74120932',
        user: customerUser?._id,
        customer: {
          fullName: 'Sophia Montgomery',
          email: customerEmail,
          phone: '+1 (555) 234-5678',
        },
        shippingAddress: {
          address: '742 Evergreen Terrace, Suite 4B',
          city: 'San Francisco',
          state: 'California',
          postalCode: '94107',
          country: 'United States',
        },
        items: [
          {
            productId: 'solstice-diamond-solitaire-ring',
            name: 'Solstice Diamond Solitaire Ring',
            price: 2499,
            quantity: 1,
            color: 'Yellow Gold',
            size: 'Size 6',
            image:
              'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80',
          },
        ],
        subtotal: 2499,
        discount: 250,
        promoCode: 'SHINE10',
        shippingFee: 0,
        deliverySurcharge: 0,
        tax: 67,
        total: 2316,
        status: 'Delivered',
        payment: {
          method: 'card',
          status: 'paid',
          transactionId: 'txn_mock_002',
          paidAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        },
        carrier: 'FedEx Priority',
        trackingNumber: 'FX-664192083',
        estimatedDeliveryDate: 'Delivered',
      },
      {
        orderId: 'LST-90214311',
        user: customerUser?._id,
        customer: {
          fullName: 'Sophia Montgomery',
          email: customerEmail,
          phone: '+1 (555) 234-5678',
        },
        shippingAddress: {
          address: 'Flat 402, Royal Palms, Bandra West',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400050',
          country: 'India',
        },
        items: [
          {
            productId: 'elysian-twisted-gold-bangle',
            name: 'Elysian Twisted Gold Bangle',
            price: 1799,
            quantity: 1,
            color: 'Gold',
            size: 'Medium (2.4)',
            image:
              'https://images.unsplash.com/photo-1611591475888-eb287e07a3c3?auto=format&fit=crop&w=600&q=80',
          },
        ],
        subtotal: 1799,
        discount: 0,
        shippingFee: 99,
        deliverySurcharge: 0,
        tax: 54,
        total: 1952,
        status: 'Confirmed',
        payment: {
          method: 'cod',
          status: 'pending',
        },
        carrier: 'Delhivery Surface',
        trackingNumber: 'DL-339210085',
        estimatedDeliveryDate: 'In 4–5 days',
      },
    ];

    for (const orderData of sampleOrders) {
      await this.orderModel.findOneAndUpdate(
        { orderId: orderData.orderId },
        orderData,
        { upsert: true, returnDocument: 'after' },
      );
    }
    this.logger.log(`✅ Seeded ${sampleOrders.length} realistic sample orders for metrics and tracking.`);

    this.logger.log('✨ All MongoDB Atlas collections successfully initialized!');
  }
}
