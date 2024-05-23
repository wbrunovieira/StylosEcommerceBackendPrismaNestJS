import { Module } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { PrismaProductVariantRepository } from "./application/repositories/prisma-product-variant-repository";


@Module({
  providers: [
    PrismaService,
    PrismaProductVariantRepository,
  ],
  exports: [
    PrismaProductVariantRepository,
  ],
})
export class ProductVariantRepositoryModule {}
