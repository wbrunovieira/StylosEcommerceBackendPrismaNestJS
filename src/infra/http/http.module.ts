import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";

import { BrandController } from "./controllers/brand.controller";
import { CategoryController } from "./controllers/category.controller";
import { ColorsController } from "./controllers/color.controller";
import { ListAllAccountsController } from "./controllers/list-all-accounts.controller";
import { MaterialController } from "./controllers/material.controller";
import { ProductController } from "./controllers/product.controller";
import { SizeController } from "./controllers/size.controller";
import { CreateBrandUseCase } from "@/domain/catalog/application/use-cases/create-brand";
import { CreateCategoryUseCase } from "@/domain/catalog/application/use-cases/create-category";
import { CreateColorUseCase } from "@/domain/catalog/application/use-cases/create-color";
import { CreateMaterialUseCase } from "@/domain/catalog/application/use-cases/create-material";
import { CreateProductUseCase } from "@/domain/catalog/application/use-cases/create-product";
import { CreateProductColorUseCase } from "@/domain/catalog/application/use-cases/create-product-color";
import { EditBrandUseCase } from "@/domain/catalog/application/use-cases/edit-brand";
import { EditCategoryUseCase } from "@/domain/catalog/application/use-cases/edit-category";
import { EditColorUseCase } from "@/domain/catalog/application/use-cases/edit-color";
import { CreateSizeUseCase } from "@/domain/catalog/application/use-cases/create-size";
import { EditMaterialUseCase } from "@/domain/catalog/application/use-cases/edit-material";
import { EditSizeUseCase } from "@/domain/catalog/application/use-cases/edit-size";
import { DeleteBrandUseCase } from "@/domain/catalog/application/use-cases/delete-brand";
import { DeleteMaterialUseCase } from "@/domain/catalog/application/use-cases/delete-material";
import { DeleteColorUseCase } from "@/domain/catalog/application/use-cases/delete-color";
import { DeleteSizeUseCase } from "@/domain/catalog/application/use-cases/delete-size";
import { DeleteCategoryUseCase } from "@/domain/catalog/application/use-cases/delete-category";
import { FindBrandByIdUseCase } from "@/domain/catalog/application/use-cases/find-brand-by-id";
import { FindMaterialByIdUseCase } from "@/domain/catalog/application/use-cases/find-material-by-id";
import { FindColorByIdUseCase } from "@/domain/catalog/application/use-cases/find-color-by-id";
import { FindSizeByIdUseCase } from "@/domain/catalog/application/use-cases/find-size-by-id";
import { FindCategoryByIdUseCase } from "@/domain/catalog/application/use-cases/find-category-by-id";
import { FindBrandByNameUseCase } from "@/domain/catalog/application/use-cases/find-brand-by-name";
import { FindMaterialByNameUseCase } from "@/domain/catalog/application/use-cases/find-material-by-name";
import { FindColorByNameUseCase } from "@/domain/catalog/application/use-cases/find-color-by-name";
import { FindCategoryByNameUseCase } from "@/domain/catalog/application/use-cases/find-category-by-name";
import { GetAllBrandsUseCase } from "@/domain/catalog/application/use-cases/get-all-brands";
import { GetAllMaterialsUseCase } from "@/domain/catalog/application/use-cases/get-all-materials";
import { GetAllColorsUseCase } from "@/domain/catalog/application/use-cases/get-all-colors";
import { GetAllSizesUseCase } from "@/domain/catalog/application/use-cases/get-all-sizes";
import { GetAllCategoriesUseCase } from "@/domain/catalog/application/use-cases/get-all-categories";
import { PrismaProductColorRepository } from "../database/prisma/repositories/prisma-product-color-repository";

@Module({
  imports: [DatabaseModule],
  controllers: [
    BrandController,
    CategoryController,
    ColorsController,
    ListAllAccountsController,
    MaterialController,
    ProductController,
    SizeController,
  ],
  providers: [
    CreateBrandUseCase,
    CreateMaterialUseCase,
    CreateColorUseCase,
    CreateSizeUseCase,
    CreateCategoryUseCase,

    CreateProductUseCase,
    // CreateProductColorUseCase,

    EditBrandUseCase,
    EditMaterialUseCase,
    EditColorUseCase,
    EditSizeUseCase,
    EditCategoryUseCase,

    DeleteBrandUseCase,
    DeleteMaterialUseCase,
    DeleteColorUseCase,
    DeleteSizeUseCase,
    DeleteCategoryUseCase,

    FindBrandByIdUseCase,
    FindMaterialByIdUseCase,
    FindColorByIdUseCase,
    FindSizeByIdUseCase,
    FindCategoryByIdUseCase,

    FindBrandByNameUseCase,
    FindMaterialByNameUseCase,
    FindColorByNameUseCase,
    FindCategoryByNameUseCase,

    GetAllBrandsUseCase,
    GetAllMaterialsUseCase,
    GetAllColorsUseCase,
    GetAllSizesUseCase,
    GetAllCategoriesUseCase,
  ],
})
export class HttpModule {}
