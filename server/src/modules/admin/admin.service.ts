import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import slugify from 'slugify';
import { Product, ProductDocument } from '../products/schemas/product.schema.js';
import { Order, OrderDocument } from '../orders/schemas/order.schema.js';
import { User, UserDocument } from '../users/schemas/user.schema.js';
import { Coupon, CouponDocument } from '../discounts/schemas/coupon.schema.js';
import { AdminCreateProductDto } from './dto/create-product.dto.js';
import { AdminUpdateProductDto } from './dto/update-product.dto.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { AdminCreateDiscountDto } from './dto/create-discount.dto.js';
import { AdminFilterOrdersDto } from './dto/filter-orders.dto.js';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Coupon.name) private readonly couponModel: Model<CouponDocument>,
  ) {}

  // 1. Dashboard Metrics
  async getDashboardMetrics() {
    const [
      orders,
      totalCustomers,
      totalProducts,
      lowStockProducts,
      recentOrdersRaw,
    ] = await Promise.all([
      this.orderModel.find({ status: { $ne: 'Cancelled' } }).select('total createdAt').exec(),
      this.userModel.countDocuments({ role: 'customer' }).exec(),
      this.productModel.countDocuments().exec(),
      this.productModel
        .find({ stockQuantity: { $lte: 15 } })
        .sort({ stockQuantity: 1 })
        .limit(6)
        .exec(),
      this.orderModel
        .find()
        .sort({ createdAt: -1 })
        .limit(6)
        .exec(),
    ]);

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Format recent orders for dashboard table
    const recentOrders = recentOrdersRaw.map((o) => {
      const created = (o as any).createdAt ? new Date((o as any).createdAt) : new Date();
      const dateFormatted = created.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      return {
        id: o.orderId,
        customer: o.customer?.fullName || 'Guest Customer',
        email: o.customer?.email || '',
        date: dateFormatted,
        amount: o.total,
        payment: o.payment?.status === 'paid' ? 'Paid' : 'Pending',
        status: o.status,
      };
    });

    // Format low-stock alerts
    const lowStockAlerts = lowStockProducts.map((p) => ({
      id: p._id.toString(),
      slug: p.slug,
      name: p.name,
      sku: 'LC-' + p.slug.slice(0, 7).toUpperCase(),
      category: p.category,
      price: p.price,
      stock: p.stockQuantity,
      status: p.stockQuantity === 0 ? 'Out of stock' : 'Low stock',
      image: p.image,
    }));

    // Weekly sales trend (last 7 days)
    const daysMap: { [key: string]: number } = {};
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toLocaleDateString('en-US', { weekday: 'short' });
      daysMap[key] = 0;
    }
    for (const o of orders) {
      const created = (o as any).createdAt ? new Date((o as any).createdAt) : null;
      if (created) {
        const dayKey = created.toLocaleDateString('en-US', { weekday: 'short' });
        if (daysMap[dayKey] !== undefined) {
          daysMap[dayKey] += o.total || 0;
        }
      }
    }
    const salesTrend = Object.entries(daysMap).map(([day, amount]) => ({
      day,
      amount,
    }));

    return {
      metrics: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        totalCustomers,
        totalProducts,
      },
      lowStockAlerts,
      recentOrders,
      salesTrend,
    };
  }

  // 2. Create Product
  async createProduct(dto: AdminCreateProductDto) {
    const cleanSlug = slugify.default ? slugify.default(dto.name, { lower: true, strict: true }) : (slugify as any)(dto.name, { lower: true, strict: true });
    let finalSlug = cleanSlug;

    const existing = await this.productModel.findOne({ slug: finalSlug }).exec();
    if (existing) {
      finalSlug = `${cleanSlug}-${Date.now().toString().slice(-4)}`;
    }

    const availability = dto.stockQuantity > 0 ? 'in-stock' : 'out-of-stock';

    const product = new this.productModel({
      ...dto,
      slug: finalSlug,
      availability,
      rating: 5.0,
      reviews: 0,
      gallery: dto.gallery && dto.gallery.length > 0 ? dto.gallery : [dto.image],
      availableColors: dto.availableColors || ['Gold'],
      availableSizes: dto.availableSizes || ['Standard (16" + 2")'],
      customerReviews: [],
    });

    await product.save();
    return product;
  }

  // 3. Update Product
  async updateProduct(id: string, dto: AdminUpdateProductDto) {
    const trimmedId = (id || '').trim();
    const query: any = Types.ObjectId.isValid(trimmedId)
      ? { $or: [{ _id: new Types.ObjectId(trimmedId) }, { slug: trimmedId }] }
      : { slug: trimmedId };

    const product = await this.productModel.findOne(query).exec();
    if (!product) {
      throw new NotFoundException(`Product '${id}' was not found.`);
    }

    // Apply updates
    Object.assign(product, dto);

    if (dto.stockQuantity !== undefined) {
      product.availability = dto.stockQuantity > 0 ? 'in-stock' : 'out-of-stock';
    }

    await product.save();
    return product;
  }

  // 4. Delete Product
  async deleteProduct(id: string) {
    const trimmedId = (id || '').trim();
    const query: any = Types.ObjectId.isValid(trimmedId)
      ? { $or: [{ _id: new Types.ObjectId(trimmedId) }, { slug: trimmedId }] }
      : { slug: trimmedId };

    const deleted = await this.productModel.findOneAndDelete(query).exec();
    if (!deleted) {
      throw new NotFoundException(`Product '${id}' not found for deletion.`);
    }

    return {
      success: true,
      message: `Product '${deleted.name}' was successfully removed from the catalog.`,
      productId: deleted._id.toString(),
    };
  }

  // 5. List Orders with Filtering
  async getOrders(dto: AdminFilterOrdersDto) {
    const filter: any = {};

    if (dto.status && dto.status !== 'All statuses' && dto.status.toLowerCase() !== 'all') {
      const normalizedStatus = dto.status.trim();
      if (normalizedStatus.toLowerCase() === 'shipped') {
        filter.$or = [{ status: 'In Transit' }, { status: 'Shipped' }];
      } else {
        filter.status = new RegExp(`^${normalizedStatus}$`, 'i');
      }
    }

    if (dto.search && dto.search.trim()) {
      const searchRegex = new RegExp(dto.search.trim(), 'i');
      filter.$or = [
        { orderId: searchRegex },
        { 'customer.fullName': searchRegex },
        { 'customer.email': searchRegex },
        { 'customer.phone': searchRegex },
      ];
    }

    const currentPage = Math.max(1, Number(dto.page || 1));
    const currentLimit = Math.max(1, Number(dto.limit || 20));
    const skip = (currentPage - 1) * currentLimit;

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(currentLimit)
        .exec(),
      this.orderModel.countDocuments(filter).exec(),
    ]);

    return {
      orders,
      total,
      page: currentPage,
      limit: currentLimit,
      totalPages: Math.ceil(total / currentLimit) || 1,
    };
  }

  // 6. Transition Order Status
  async updateOrderStatus(id: string, dto: UpdateOrderStatusDto) {
    const trimmedId = (id || '').trim();
    const query: any = Types.ObjectId.isValid(trimmedId)
      ? { $or: [{ _id: new Types.ObjectId(trimmedId) }, { orderId: new RegExp(`^${trimmedId}$`, 'i') }] }
      : { orderId: new RegExp(`^${trimmedId}$`, 'i') };

    const order = await this.orderModel.findOne(query).exec();
    if (!order) {
      throw new NotFoundException(`Order '${id}' not found.`);
    }

    let targetStatus = dto.status.trim();
    if (targetStatus.toLowerCase() === 'shipped') {
      targetStatus = 'In Transit';
    }

    order.status = targetStatus;

    if (dto.trackingNumber) {
      order.trackingNumber = dto.trackingNumber.trim();
    } else if (targetStatus === 'In Transit' && !order.trackingNumber) {
      order.trackingNumber = 'BD-' + Math.floor(100000000 + Math.random() * 900000000);
    }

    if (dto.carrier) {
      order.carrier = dto.carrier.trim();
    }

    // When status reaches Delivered, if COD was pending, mark payment paid
    if (targetStatus === 'Delivered' && order.payment?.method === 'cod' && order.payment.status === 'pending') {
      order.payment.status = 'paid';
      order.payment.paidAt = new Date();
    }

    await order.save();

    return {
      success: true,
      message: `Order ${order.orderId} status transitioned to '${order.status}'.`,
      order,
    };
  }

  // 7. Create Discount Coupon
  async createDiscount(dto: AdminCreateDiscountDto) {
    const normalizedCode = dto.code.trim().toUpperCase();

    const existing = await this.couponModel.findOne({ code: normalizedCode }).exec();
    if (existing) {
      throw new ConflictException(`Coupon code '${normalizedCode}' already exists.`);
    }

    const coupon = new this.couponModel({
      code: normalizedCode,
      type: dto.type,
      value: dto.value,
      minOrderAmount: dto.minOrderAmount || 0,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    });

    await coupon.save();
    return coupon;
  }

  // 8. List Discounts
  async getDiscounts() {
    return this.couponModel.find().sort({ createdAt: -1 }).exec();
  }

  // 9. Delete Discount
  async deleteDiscount(id: string) {
    const trimmedId = (id || '').trim();
    const query: any = Types.ObjectId.isValid(trimmedId)
      ? { $or: [{ _id: new Types.ObjectId(trimmedId) }, { code: trimmedId.toUpperCase() }] }
      : { code: trimmedId.toUpperCase() };

    const deleted = await this.couponModel.findOneAndDelete(query).exec();
    if (!deleted) {
      throw new NotFoundException(`Coupon '${id}' not found for deletion.`);
    }

    return {
      success: true,
      message: `Coupon '${deleted.code}' deleted successfully.`,
    };
  }
}
