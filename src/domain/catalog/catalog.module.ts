
import { Module } from '@nestjs/common';
import { ColorsController } from '../../controllers/create-colors.controller';
import { CreateColorUseCase } from './application/use-cases/create-color';

import { PrismaColorRepository } from '../../domain/catalog/application/repositories/prisma-color-repository'
import { PrismaService } from '../../prisma/prisma.service';
import { DeleteColorUseCase } from './application/use-cases/delete-color';
import { EditColorUseCase } from './application/use-cases/edit-color';

@Module({
  controllers: [ColorsController],
  providers: [
    CreateColorUseCase,

    {
      provide: PrismaColorRepository,
      useClass: PrismaColorRepository,
    },
    PrismaService,
    DeleteColorUseCase,
    EditColorUseCase
  ],
  exports: [], 
})
export class CatalogModule {}
