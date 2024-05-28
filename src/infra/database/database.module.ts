import { IBrandRepository } from "@/domain/catalog/application/repositories/i-brand-repository";
import { PrismaService } from "@/prisma/prisma.service";
import { Module } from "@nestjs/common";
import { PrismaBrandRepository } from "./prisma/repositories/prisma-brand-repository";
import { ICategoryRepository } from "@/domain/catalog/application/repositories/i-category-repository";
import { PrismaCategoryRepository } from "./prisma/repositories/prisma-category-repository";
import { IColorRepository } from "@/domain/catalog/application/repositories/i-color-repository";
import { PrismaColorRepository } from "./prisma/repositories/prisma-color-repository";
import { IMaterialRepository } from "@/domain/catalog/application/repositories/i-material-repository";
import { PrismaMaterialRepository } from "./prisma/repositories/prisma-material-repository";
import { IProductCategoryRepository } from "@/domain/catalog/application/repositories/i-product-category-repository";
import { PrismaProductCategoryRepository } from "./prisma/repositories/prisma-product-category-repository";
import { IProductColorRepository } from "@/domain/catalog/application/repositories/i-product-color-repository";
import { PrismaProductColorRepository } from "./prisma/repositories/prisma-product-color-repository";
import { IProductRepository } from "@/domain/catalog/application/repositories/i-product-repository";
import { PrismaProductRepository } from "./prisma/repositories/prisma-product-repository";
import { IProductSizeRepository } from "@/domain/catalog/application/repositories/i-product-size-repository";
import { PrismaProductSizeRepository } from "./prisma/repositories/prisma-product-size-repository";
import { IProductVariantRepository } from "@/domain/catalog/application/repositories/i-product-variant-repository";
import { PrismaProductVariantRepository } from "./prisma/repositories/prisma-product-variant-repository";
import { ISizeRepository } from "@/domain/catalog/application/repositories/i-size-repository";
import { PrismaSizeRepository } from "./prisma/repositories/prima-size-repository";

@Module({
  providers: [
    PrismaService,
    {
      provide: IBrandRepository,
      useClass: PrismaBrandRepository,
    },
    {
      provide: ICategoryRepository,
      useClass: PrismaCategoryRepository,
    },
    {
      provide: IColorRepository,
      useClass: PrismaColorRepository,
    },
    {
      provide: IProductRepository,
      useClass: PrismaProductRepository,
    },
    {
      provide: IMaterialRepository,
      useClass: PrismaMaterialRepository,
    },
    {
      provide: IProductCategoryRepository,
      useClass: PrismaProductCategoryRepository,
    },
    {
      provide: IProductSizeRepository,
      useClass: PrismaProductSizeRepository,
    },
    {
      provide: IProductColorRepository,
      useClass: PrismaProductColorRepository,
    },
    {
      provide: IProductVariantRepository,
      useClass: PrismaProductVariantRepository,
    },
    {
      provide: ISizeRepository,
      useClass: PrismaSizeRepository,
    },
    PrismaColorRepository,
    PrismaSizeRepository,
    PrismaCategoryRepository,
    
  ],
  exports: [
    PrismaService,
    IBrandRepository,
    IMaterialRepository,
    ICategoryRepository,
    IColorRepository,
    ISizeRepository,
    IProductRepository,
    IProductCategoryRepository,
    IProductSizeRepository,
    IProductColorRepository,
    IProductVariantRepository,
  ],
})
export class DatabaseModule {}