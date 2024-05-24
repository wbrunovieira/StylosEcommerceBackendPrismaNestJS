import { Module } from "@nestjs/common";
import { ColorsController } from "../../infra/http/controllers/color.controller";

import { IBrandRepository } from "./application/repositories/i-brand-repository";

import { PrismaColorRepository } from "../../infra/database/prisma/repositories/prisma-color-repository";
import { PrismaService } from "../../prisma/prisma.service";
import { DeleteColorUseCase } from "./application/use-cases/delete-color";
import { EditColorUseCase } from "./application/use-cases/edit-color";
import { SizeController } from "@/infra/http/controllers/size.controller";
import { CreateSizeUseCase } from "./application/use-cases/create-size";
import { PrismaSizeRepository } from "../../infra/database/prisma/repositories/prima-size-repository";
import { DeleteSizeUseCase } from "./application/use-cases/delete-size";
import { EditSizeUseCase } from "./application/use-cases/edit-size";
import { BrandController } from "@/infra/http/controllers/brand.controller";
import { CreateBrandUseCase } from "./application/use-cases/create-brand";
import { PrismaBrandRepository } from "../../infra/database/prisma/repositories/prisma-brand-repository";
import { DeleteBrandUseCase } from "./application/use-cases/delete-brand";
import { EditBrandUseCase } from "./application/use-cases/edit-brand";
import { MaterialController } from "@/infra/http/controllers/material.controller";
import { CreateMaterialUseCase } from "./application/use-cases/create-material";
import { PrismaMaterialRepository } from "../../infra/database/prisma/repositories/prisma-material-repository";
import { EditMaterialUseCase } from "./application/use-cases/edit-material";
import { DeleteMaterialUseCase } from "./application/use-cases/delete-material";
import { CategoryController } from "@/infra/http/controllers/category.controller";
import { CreateCategoryUseCase } from "./application/use-cases/create-category";
import { PrismaCategoryRepository } from "../../infra/database/prisma/repositories/prisma-category-repository";
import { EditCategoryUseCase } from "./application/use-cases/edit-category";
import { DeleteCategoryUseCase } from "./application/use-cases/delete-category";

import { IColorRepository } from "./application/repositories/i-color-repository";
import { ISizeRepository } from "./application/repositories/i-size-repository";
import { IMaterialRepository } from "./application/repositories/i-material-repository";
import { ICategoryRepository } from "./application/repositories/i-category-repository";
import { FindBrandByNameUseCase } from "./application/use-cases/find-brand-by-name";
import { GetAllBrandsUseCase } from "./application/use-cases/get-all-brands";
import { FindBrandByIdUseCase } from "./application/use-cases/find-brand-by-id";
import { FindMaterialByNameUseCase } from "./application/use-cases/find-material-by-name";
import { FindMaterialByIdUseCase } from "./application/use-cases/find-material-by-id";
import { GetAllMaterialsUseCase } from "./application/use-cases/get-all-materials";
import { CreateColorUseCase } from "./application/use-cases/create-color";
import { FindColorByIdUseCase } from "./application/use-cases/find-color-by-id";
import { GetAllColorsUseCase } from "./application/use-cases/get-all-colors";
import { FindColorByNameUseCase } from "./application/use-cases/find-color-by-name";
import { FindSizeByIdUseCase } from "./application/use-cases/find-size-by-id";
import { GetAllSizesUseCase } from "./application/use-cases/get-all-sizes";
import { GetAllCategoriesUseCase } from "./application/use-cases/get-all-categories";
import { FindCategoryByIdUseCase } from "./application/use-cases/find-category-by-id";
import { FindCategoryByNameUseCase } from "./application/use-cases/find-category-by-name";
import { ProductController } from "@/infra/http/controllers/product.controller";
import { CreateProductUseCase } from "./application/use-cases/create-product";
import { IProductRepository } from "./application/repositories/i-product-repository";
import { PrismaProductRepository } from "../../infra/database/prisma/repositories/prisma-product-repository";
import { IProductVariantRepository } from "./application/repositories/i-product-variant-repository";
import { PrismaProductVariantRepository } from "../../infra/database/prisma/repositories/prisma-product-variant-repository";

import { PrismaProductSizeRepository } from "../../infra/database/prisma/repositories/prisma-product-size-repository";
import { IProductSizeRepository } from "./application/repositories/i-product-size-repository";

import { IProductCategoryRepository } from "./application/repositories/i-product-category-repository";
import { PrismaProductCategoryRepository } from "../../infra/database/prisma/repositories/prisma-product-category-repository";
import { IProductColorRepository } from "./application/repositories/i-product-color-repository";
import { PrismaProductColorRepository } from "../../infra/database/prisma/repositories/prisma-product-color-repository";

@Module({
  controllers: [
    BrandController,
    ColorsController,
    SizeController,
    MaterialController,
    CategoryController,
    ProductController,
  ],
  providers: [
    CreateBrandUseCase,
    EditBrandUseCase,
    DeleteBrandUseCase,
    FindBrandByNameUseCase,
    CreateColorUseCase,
    EditColorUseCase,
    DeleteColorUseCase,
    CreateMaterialUseCase,
    EditMaterialUseCase,
    EditSizeUseCase,
    DeleteMaterialUseCase,
    DeleteSizeUseCase,
    CreateSizeUseCase,
    CreateCategoryUseCase,
    EditCategoryUseCase,
    DeleteCategoryUseCase,
    FindCategoryByIdUseCase,
    FindCategoryByNameUseCase,

    GetAllBrandsUseCase,
    FindBrandByIdUseCase,
    FindMaterialByNameUseCase,
    FindMaterialByIdUseCase,
    GetAllMaterialsUseCase,
    FindColorByIdUseCase,
    GetAllColorsUseCase,
    FindColorByNameUseCase,
    FindSizeByIdUseCase,
    GetAllSizesUseCase,
    GetAllCategoriesUseCase,
    CreateProductUseCase,

    PrismaService,
  ],
  exports: [
    PrismaService,
    IBrandRepository,
    IColorRepository,
    ISizeRepository,
    IMaterialRepository,
    ICategoryRepository,
  ],
})
export class CatalogModule {}
