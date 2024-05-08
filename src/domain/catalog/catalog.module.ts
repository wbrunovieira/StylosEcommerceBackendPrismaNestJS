import { Module } from "@nestjs/common";
import { ColorsController } from "../../controllers/create-colors.controller";
import { CreateColorUseCase } from "./application/use-cases/create-color";

import { PrismaColorRepository } from "../../domain/catalog/application/repositories/prisma-color-repository";
import { PrismaService } from "../../prisma/prisma.service";
import { DeleteColorUseCase } from "./application/use-cases/delete-color";
import { EditColorUseCase } from "./application/use-cases/edit-color";
import { SizeController } from "@/controllers/create-size.controller";
import { CreateSizeUseCase } from "./application/use-cases/create-size";
import { PrismaSizeRepository } from "./application/repositories/prima-size-repository";
import { DeleteSizeUseCase } from "./application/use-cases/delete-size";
import { EditSizeUseCase } from "./application/use-cases/edit-size";
import { BrandController } from "@/controllers/create-brand.controller";
import { CreateBrandUseCase } from "./application/use-cases/create-brand";
import { PrismaBrandRepository } from "./application/repositories/prisma-brand-repository";
import { DeleteBrandUseCase } from "./application/use-cases/delete-brand";
import { EditBrandUseCase } from "./application/use-cases/edit-brand";

@Module({
  controllers: [ColorsController, SizeController, BrandController],
  providers: [
    CreateColorUseCase,
    CreateSizeUseCase,
    CreateBrandUseCase,

    {
      provide: PrismaColorRepository,
      useClass: PrismaColorRepository,
    },
    {
      provide: PrismaSizeRepository,
      useClass: PrismaSizeRepository,
    },
    {
      provide: PrismaBrandRepository,
      useClass: PrismaBrandRepository,
    },
    PrismaService,
    DeleteColorUseCase,
    EditColorUseCase,
    DeleteSizeUseCase,
    EditSizeUseCase,
    DeleteBrandUseCase,
    EditBrandUseCase,
  ],
  exports: [],
})
export class CatalogModule {}
