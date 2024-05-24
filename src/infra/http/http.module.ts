import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module';
import { AccountController } from './controllers/account.controller';
import { AuthenticateController } from './controllers/authenticate.controller';
import { BrandController } from './controllers/brand.controller';
import { CategoryController } from './controllers/category.controller';
import { ColorsController } from './controllers/color.controller';
import { ListAllAccountsController } from './controllers/list-all-accounts.controller';
import { MaterialController } from './controllers/material.controller';
import { ProductController } from './controllers/product.controller';
import { SizeController } from './controllers/size.controller';
import { CreateBrandUseCase } from '@/domain/catalog/application/use-cases/create-brand';
import { CreateCategoryUseCase } from '@/domain/catalog/application/use-cases/create-category';
import { CreateColorUseCase } from '@/domain/catalog/application/use-cases/create-color';
import { CreateMaterialUseCase } from '@/domain/catalog/application/use-cases/create-material';
import { CreateProductUseCase } from '@/domain/catalog/application/use-cases/create-product';
import { ColorOnProductUseCase } from '@/domain/catalog/application/use-cases/color-on-product';


@Module({
  imports: [DatabaseModule],
  controllers: [
    AccountController,
    AuthenticateController,
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
    CreateCategoryUseCase,
    CreateColorUseCase,
    CreateMaterialUseCase,
    CreateProductUseCase,
    ColorOnProductUseCase
    
  ],
})
export class HttpModule {}