import { Module } from "@nestjs/common";
import { ColorsController } from "../../controllers/color.controller";

import { IBrandRepository } from "./application/repositories/i-brand-repository";

import { PrismaColorRepository } from "../../domain/catalog/application/repositories/prisma-color-repository";
import { PrismaService } from "../../prisma/prisma.service";
import { DeleteColorUseCase } from "./application/use-cases/delete-color";
import { EditColorUseCase } from "./application/use-cases/edit-color";
import { SizeController } from "@/controllers/size.controller";
import { CreateSizeUseCase } from "./application/use-cases/create-size";
import { PrismaSizeRepository } from "./application/repositories/prima-size-repository";
import { DeleteSizeUseCase } from "./application/use-cases/delete-size";
import { EditSizeUseCase } from "./application/use-cases/edit-size";
import { BrandController } from "@/controllers/brand.controller";
import { CreateBrandUseCase } from "./application/use-cases/create-brand";
import { PrismaBrandRepository } from "./application/repositories/prisma-brand-repository";
import { DeleteBrandUseCase } from "./application/use-cases/delete-brand";
import { EditBrandUseCase } from "./application/use-cases/edit-brand";
import { MaterialController } from "@/controllers/material.controller";
import { CreateMaterialUseCase } from "./application/use-cases/create-material";
import { PrismaMaterialRepository } from "./application/repositories/prisma-material-repository";
import { EditMaterialUseCase } from "./application/use-cases/edit-material";
import { DeleteMaterialUseCase } from "./application/use-cases/delete-material";
import { CategoryController } from "@/controllers/category.controller";
import { CreateCategoryUseCase } from "./application/use-cases/create-category";
import { PrismaCategoryRepository } from "./application/repositories/prisma-category-repository";
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

@Module({
  controllers: [
    BrandController,
    ColorsController,
    SizeController,
    MaterialController,
    CategoryController,
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

    PrismaService,
    {
      provide: IBrandRepository,
      useClass: PrismaBrandRepository,
    },
    {
      provide: IColorRepository,
      useClass: PrismaColorRepository,
    },
    {
      provide: ISizeRepository,
      useClass: PrismaSizeRepository,
    },
    {
      provide: IMaterialRepository,
      useClass: PrismaMaterialRepository,
    },
    {
      provide: ICategoryRepository,
      useClass: PrismaCategoryRepository,
    },
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
