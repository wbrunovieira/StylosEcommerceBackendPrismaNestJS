import { Either, left, right } from "../../../../core/either";
import { IProductVariantRepository } from "../../../../domain/catalog/application/repositories/i-product-variant-repository";
import { ProductVariant } from "../../../../domain/catalog/enterprise/entities/product-variant";
import { PrismaService } from "@/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { ProductStatus } from "@prisma/client";

@Injectable()
export class PrismaProductVariantRepository
  implements IProductVariantRepository
{
  constructor(private prisma: PrismaService) {}

  async create(productVariant: ProductVariant): Promise<Either<Error, void>> {
    try {
      await this.prisma.productVariant.create({
        data: {
          id: productVariant.id.toString(),
          productId: productVariant.productId.toString(),
          sizeId: productVariant.sizeId?.toString(),
          colorId: productVariant.colorId?.toString(),
          sku: productVariant.sku,
          stock: productVariant.stock,
          price: productVariant.price,
          status: productVariant.status,
          images: productVariant.images,
          createdAt: productVariant.createdAt,
          updatedAt: productVariant.updatedAt,
        },
      });
      return right(undefined);
    } catch (error) {
      return left(new Error("Failed to create product variant"));
    }
  }

  async findByProductId(productId: string): Promise<ProductVariant[]> {
    const variants = await this.prisma.productVariant.findMany({
      where: { productId },
    });
    return variants.map((variant) =>
      ProductVariant.create(
        {
          productId: new UniqueEntityID(variant.productId),
          sizeId: variant.sizeId
            ? new UniqueEntityID(variant.sizeId)
            : undefined,
          colorId: variant.colorId
            ? new UniqueEntityID(variant.colorId)
            : undefined,
          stock: variant.stock,
          price: variant.price,
          status: variant.status as ProductStatus,
          images: variant.images,
         
          createdAt: variant.createdAt,
        },
        new UniqueEntityID(variant.id)
      )
    );
  }

  async findByProductIds(productIds: string[]): Promise<ProductVariant[]> {
    const variants = await this.prisma.productVariant.findMany({
      where: {
        productId: {
          in: productIds,
        },
      },
    });
    return variants.map((variant) =>
      ProductVariant.create(
        {
          productId: new UniqueEntityID(variant.productId),
          sizeId: variant.sizeId
            ? new UniqueEntityID(variant.sizeId)
            : undefined,
          colorId: variant.colorId
            ? new UniqueEntityID(variant.colorId)
            : undefined,
          stock: variant.stock,
          price: variant.price,
          status: variant.status,
          images: variant.images,
          createdAt: variant.createdAt,
        },
        new UniqueEntityID(variant.id)
      )
    );
  }
}
