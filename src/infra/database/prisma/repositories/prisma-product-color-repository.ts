import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../prisma/prisma.service";
import { IProductColorRepository } from "../../../../domain/catalog/application/repositories/i-product-color-repository";
import { Either, left, right } from "@/core/either";
import { ProductColor } from "../../../../domain/catalog/enterprise/entities/product-color";

@Injectable()
export class PrismaProductColorRepository implements IProductColorRepository {
  constructor(private prisma: PrismaService) {}

  // async create(
  //   productId: string,
  //   colorId: string
  // ): Promise<Either<Error, void>> {
  //   try {
  //     const colorExists = await this.prisma.color.findUnique({
  //       where: { id: colorId },
  //     });
  //     if (!colorExists) {
  //       throw new Error("Color not found");
  //     }

  //     const productExists = await this.prisma.product.findUnique({
  //       where: { id: productId },
  //     });
  //     if (!productExists) {
  //       throw new Error("Product not found");
  //     }
  //     await this.prisma.productColor.create({
  //       data: {
  //         productId,
  //         colorId,
  //       },
  //     });
  //     await this.prisma.productColor.create({
  //       data: { productId, colorId },
  //     });

  //     return right(undefined);
  //   } catch (error) {
  //     return left(new Error("Failed to create product color"));
  //   }
  // }
  create(productId: string, ColorId: string): Promise<Either<Error, void>> {
    throw new Error("Method not implemented.");
  }

  findByProductId(productId: string): Promise<ProductColor[]> {
    throw new Error("Method not implemented.");
  }
  findByColorId(ColorId: string): Promise<ProductColor[]> {
    throw new Error("Method not implemented.");
  }
  addItem(ProductColor: any): void {
    throw new Error("Method not implemented.");
  }
  delete(productColor: ProductColor): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
