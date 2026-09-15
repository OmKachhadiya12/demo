import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { Product, ProductSchema } from './schemas/product.schema.js';
import { User, UserSchema } from '../users/schemas/user.schema.js';
import { Order, OrderSchema } from '../orders/schemas/order.schema.js';
import { ProductsService } from './products.service.js';
import { ProductsController } from './products.controller.js';
import { SeederService } from './seeder.service.js';
import { DiscountsModule } from '../discounts/discounts.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: User.name, schema: UserSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    DiscountsModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService, SeederService],
  exports: [ProductsService, MongooseModule, SeederService],
})
export class ProductsModule {}
