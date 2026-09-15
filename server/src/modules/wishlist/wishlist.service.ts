import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema.js';
import { Product, ProductDocument } from '../products/schemas/product.schema.js';

@Injectable()
export class WishlistService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
  ) {}

  async getWishlist(userId: string | Types.ObjectId) {
    const user = await this.userModel
      .findById(userId)
      .populate('wishlist')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user.wishlist || [];
  }

  async toggleWishlist(userId: string | Types.ObjectId, productIdOrSlug: string) {
    let product: ProductDocument | null = null;
    if (Types.ObjectId.isValid(productIdOrSlug)) {
      product = await this.productModel.findById(productIdOrSlug).exec();
    }
    if (!product) {
      product = await this.productModel.findOne({ slug: productIdOrSlug }).exec();
    }
    if (!product) {
      throw new NotFoundException(`Product '${productIdOrSlug}' not found.`);
    }

    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const existingIndex = user.wishlist.findIndex(
      (id) => id.toString() === product._id.toString(),
    );

    let inWishlist = false;
    if (existingIndex > -1) {
      user.wishlist.splice(existingIndex, 1);
      inWishlist = false;
    } else {
      user.wishlist.push(product._id as any);
      inWishlist = true;
    }

    await user.save();
    const populated = await this.userModel.findById(userId).populate('wishlist').exec();

    return {
      inWishlist,
      message: inWishlist
        ? `${product.name} added to your wishlist.`
        : `${product.name} removed from your wishlist.`,
      product,
      wishlist: populated?.wishlist || [],
    };
  }
}
