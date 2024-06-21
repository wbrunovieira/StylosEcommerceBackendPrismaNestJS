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

import { ApiController } from "./controllers/api.controller";
import { ApiGetAllProducts } from "@/domain/catalog/application/use-cases/api-all-products";
import { CreateProductSizeUseCase } from "@/domain/catalog/application/use-cases/create-product-size";
import { CreateProductCategoryUseCase } from "@/domain/catalog/application/use-cases/create-product-category";
import { AccountController } from "./controllers/account.controller";
import { CreateAccountUseCase } from "@/domain/auth/application/use-cases/create-account";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "@/prisma/prisma.service";
import { CreateGoogleAccountUseCase } from "@/domain/auth/application/use-cases/create-account-with-google";
import { AddressController } from "./controllers/address.controller";
import { CreateAddressUseCase } from "@/domain/auth/application/use-cases/create-address";
import { CartController } from "./controllers/cart.controller";
import { CreateCartUseCase } from "@/domain/order/application/use-cases/create-cart";
import { AuthModule } from "@/auth/auth.module";

import { EditProductUseCase } from "@/domain/catalog/application/use-cases/edit-product";
import { GetProductBySlugUseCase } from "@/domain/catalog/application/use-cases/get-product-by-slug";
import { GetProductsByCategoryIdUseCase } from "@/domain/catalog/application/use-cases/get-all-products-by-category";
import { FindProductByNameUseCase } from "@/domain/catalog/application/use-cases/find-all-products-by-name";
import { GetProductsByBrandIdUseCase } from "@/domain/catalog/application/use-cases/get-all-products-by-brand";
import { GetProductsByColorIdUseCase } from "@/domain/catalog/application/use-cases/get-all-products-by-color";
import { GetProductsBySizeIdUseCase } from "@/domain/catalog/application/use-cases/get-all-products-by-size";
import { GetProductsByPriceRangeUseCase } from "@/domain/catalog/application/use-cases/get-all-products-by-price-range";
import { GetProductsByMaterialIdUseCase } from "@/domain/catalog/application/use-cases/get-all-products-by-material";
import { GetAllProductsByIdUseCase } from "@/domain/catalog/application/use-cases/get-all-products-by-id";
import { UpdateProductVariantUseCase } from "@/domain/catalog/application/use-cases/update-product-variant-use-case";

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [
    BrandController,
    CategoryController,
    ColorsController,
    ListAllAccountsController,
    MaterialController,
    ProductController,
    SizeController,
    ApiController,
    AccountController,
    AddressController,
    CartController,
  ],
  providers: [
    JwtService,
    PrismaService,
    CreateBrandUseCase,
    CreateMaterialUseCase,
    CreateColorUseCase,
    CreateSizeUseCase,
    CreateCategoryUseCase,

    CreateProductUseCase,
    CreateProductColorUseCase,
    CreateProductSizeUseCase,
    CreateProductCategoryUseCase,

    EditBrandUseCase,
    EditMaterialUseCase,
    EditColorUseCase,
    EditSizeUseCase,
    EditCategoryUseCase,
    EditProductUseCase,

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

    GetProductBySlugUseCase,

    GetAllBrandsUseCase,
    GetAllMaterialsUseCase,
    GetAllColorsUseCase,
    GetAllSizesUseCase,
    GetAllCategoriesUseCase,
    GetProductsByCategoryIdUseCase,
    GetProductsByBrandIdUseCase,
    GetProductsByColorIdUseCase,
    GetProductsBySizeIdUseCase,
    GetProductsByPriceRangeUseCase,
    GetProductsByMaterialIdUseCase,
    GetAllProductsByIdUseCase,
    FindProductByNameUseCase,
    UpdateProductVariantUseCase,

    ApiGetAllProducts,

    CreateAccountUseCase,
    CreateGoogleAccountUseCase,

    CreateAddressUseCase,

    CreateCartUseCase,
  ],
})
export class HttpModule {}
