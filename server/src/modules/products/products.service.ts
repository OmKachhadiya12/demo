import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema.js';
import { FilterProductsDto } from './dto/filter-products.dto.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import type { UserDocument } from '../users/schemas/user.schema.js';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
  ) {}

  async findAll(query: FilterProductsDto) {
    const {
      category,
      collection,
      finish,
      minPrice,
      maxPrice,
      sort,
      search,
      page = 1,
      limit = 12,
    } = query;

    const filter: any = {};

    if (category) {
      filter.category = category.toLowerCase().trim();
    }

    if (collection) {
      filter.collectionName = collection.toLowerCase().trim();
    }

    if (finish) {
      filter.finish = new RegExp(`^${finish.trim()}$`, 'i');
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { tags: searchRegex },
        { category: searchRegex },
      ];
    }

    const sortOptions: any = {};
    if (sort === 'price-asc') {
      sortOptions.price = 1;
    } else if (sort === 'price-desc') {
      sortOptions.price = -1;
    } else if (sort === 'rating') {
      sortOptions.rating = -1;
    } else if (sort === 'popular') {
      sortOptions.reviews = -1;
    } else {
      // Default: newest first
      sortOptions.createdAt = -1;
    }

    const currentPage = Math.max(1, Number(page));
    const currentLimit = Math.max(1, Number(limit));
    const skip = (currentPage - 1) * currentLimit;

    const [items, total] = await Promise.all([
      this.productModel
        .find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(currentLimit)
        .exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);

    return {
      items,
      total,
      page: currentPage,
      limit: currentLimit,
      totalPages: Math.ceil(total / currentLimit) || 1,
    };
  }

  async findBySlug(slug: string): Promise<ProductDocument> {
    const product = await this.productModel.findOne({ slug: slug.trim() }).exec();
    if (!product) {
      throw new NotFoundException(`Product with slug '${slug}' not found.`);
    }
    return product;
  }

  async findById(id: string): Promise<ProductDocument> {
    let product: ProductDocument | null = null;
    if (Types.ObjectId.isValid(id)) {
      product = await this.productModel.findById(id).exec();
    }
    if (!product) {
      product = await this.productModel.findOne({ slug: id }).exec();
    }
    if (!product) {
      throw new NotFoundException(`Product not found.`);
    }
    return product;
  }

  async findRelated(idOrSlug: string): Promise<ProductDocument[]> {
    const current = await this.findById(idOrSlug);

    const related = await this.productModel
      .find({
        _id: { $ne: current._id },
        category: current.category,
      })
      .limit(4)
      .exec();

    // If fewer than 4 in same category, top up with other bestseller products
    if (related.length < 4) {
      const topUps = await this.productModel
        .find({
          _id: { $nin: [current._id, ...related.map((r) => r._id)] },
        })
        .limit(4 - related.length)
        .exec();
      return [...related, ...topUps];
    }

    return related;
  }

  async addReview(
    idOrSlug: string,
    user: UserDocument,
    dto: CreateReviewDto,
  ): Promise<ProductDocument> {
    const product = await this.findById(idOrSlug);

    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const newReview = {
      id: now.getTime().toString(),
      author: user.name || 'Verified Customer',
      rating: Number(dto.rating),
      date: dateFormatted,
      verified: true,
      title: dto.title.trim(),
      comment: dto.comment.trim(),
    };

    product.customerReviews.unshift(newReview);

    // Recompute aggregate average rating & reviews count
    const totalRating = product.customerReviews.reduce((sum, r) => sum + r.rating, 0);
    product.reviews = product.customerReviews.length;
    product.rating = Number((totalRating / product.reviews).toFixed(1));

    await product.save();
    return product;
  }
}
