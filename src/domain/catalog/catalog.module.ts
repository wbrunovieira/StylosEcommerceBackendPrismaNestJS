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

@Module({
  controllers: [ColorsController, SizeController],
  providers: [
    CreateColorUseCase,
    CreateSizeUseCase,

    {
      provide: PrismaColorRepository,
      useClass: PrismaColorRepository,
    },
    {
      provide: PrismaSizeRepository,
      useClass: PrismaSizeRepository,
    },
    PrismaService,
    DeleteColorUseCase,
    EditColorUseCase,
    DeleteSizeUseCase,
    EditSizeUseCase,
  ],
  exports: [],
})
export class CatalogModule {}
