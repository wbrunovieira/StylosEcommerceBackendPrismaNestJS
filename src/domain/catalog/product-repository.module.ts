import { PrismaService } from "@/prisma/prisma.service";
import { Module } from "@nestjs/common";
import { PrismaProductColorRepository } from "./application/repositories/prisma-product-color-repository";
import { PrismaProductSizeRepository } from "./application/repositories/prisma-product-size-repository";
import { PrismaProductCategoryRepository } from "./application/repositories/prisma-product-category-repository";
import { PrismaProductRepository } from "./application/repositories/prisma-product-repository";
import { PrismaProductVariantRepository } from "./application/repositories/prisma-product-variant-repository";
import { ProductController } from "@/controllers/product.controller";
import { CreateProductUseCase } from "./application/use-cases/create-product";

@Module({
  controllers: [ProductController],
  providers: [
    PrismaService,
    PrismaProductRepository,
    PrismaProductColorRepository,
    PrismaProductSizeRepository,
    PrismaProductCategoryRepository,
  
    CreateProductUseCase,
  ],
  exports: [PrismaProductRepository],
})
export class ProductRepositoryModule {}
