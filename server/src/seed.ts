import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { SeederService } from './modules/products/seeder.service.js';
// @ts-expect-error - JavaScript source file from frontend
import { products } from '../../lustre-and-co/src/data/products.js';

async function bootstrap() {
  console.log('🚀 Initializing NestJS seeder context...');
  const app = await NestFactory.createApplicationContext(AppModule);
  const seeder = app.get(SeederService);

  try {
    console.log(`📦 Loaded ${products.length} products from frontend catalog data.`);
    await seeder.seed(products);
    console.log('🎉 Seeding successfully completed!');
  } catch (error) {
    console.error('❌ Seeding failed with error:', error);
  } finally {
    await app.close();
    process.exit(0);
  }
}

bootstrap();
