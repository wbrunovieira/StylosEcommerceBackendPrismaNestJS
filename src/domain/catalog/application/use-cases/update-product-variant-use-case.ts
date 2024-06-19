// src/domain/catalog/application/use-cases/update-product-variant.use-case.ts
import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { IProductVariantRepository } from "../repositories/i-product-variant-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import {
  toDomainProductStatus,
  toPrismaProductStatus,
} from "@/infra/database/prisma/utils/convert-product-status";
import { ProductStatus as DomainProductStatus } from "../../enterprise/entities/product-status";

interface UpdateProductVariantUseCaseRequest {
  productId: string;
  variantUpdates: Array<{
    id: string;
    sku?: string;
    stock?: number;
    price?: number;
    images?: string[];
    status?: DomainProductStatus;
  }>;
}

type UpdateProductVariantUseCaseResponse = Either<ResourceNotFoundError, void>;

@Injectable()
export class UpdateProductVariantUseCase {
  constructor(private productVariantRepository: IProductVariantRepository) {}

  async execute({
    productId,
    variantUpdates,
  }: UpdateProductVariantUseCaseRequest): Promise<UpdateProductVariantUseCaseResponse> {
    const variantsOrError =
      await this.productVariantRepository.findByProductId(productId);

    if (variantsOrError.isLeft() || variantsOrError.value.length === 0) {
      return left(
        new ResourceNotFoundError(
          `Variants not found for product id: ${productId}`
        )
      );
    }

    const variants = variantsOrError.value;

    for (const update of variantUpdates) {
      const variant = variants.find((v) => v.id.toString() === update.id);

      if (!variant) {
        continue;
      }

      if (update.sku !== undefined) variant.sku = update.sku;
      if (update.stock !== undefined) variant.stock = update.stock;
      if (update.price !== undefined) variant.price = update.price;
      if (update.images !== undefined) variant.images = update.images;
      if (update.status !== undefined) {
        const prismaStatus = toPrismaProductStatus(update.status);
        variant.status = toDomainProductStatus(prismaStatus);
      }

      const updateResult = await this.productVariantRepository.update(variant);

      if (updateResult.isLeft()) {
        return left(
          new ResourceNotFoundError(
            `Failed to update variant with id: ${update.id}`
          )
        );
      }
    }

    return right(undefined);
  }
}
