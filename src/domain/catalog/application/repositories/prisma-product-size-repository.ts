import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../prisma/prisma.service";
import { IProductSizeRepository } from "./i-product-size-repository";
import { ProductSize } from "../../enterprise/entities/product-size";

@Injectable()
export class PrismaProductSizeRepository implements IProductSizeRepository {
  constructor(private prisma: PrismaService) {}
  findByProductId(productId: string): Promise<ProductSize[]> {
    throw new Error("Method not implemented.");
  }
  findBySizeId(sizeId: string): Promise<ProductSize[]> {
    throw new Error("Method not implemented.");
  }
  addItem(ProductSize: any): void {
    throw new Error("Method not implemented.");
  }
  async create(productId: string, sizeId: string): Promise<void> {
    await this.prisma.productSize.create({
      data: { productId, sizeId },
    });
  }

  //   async findByProductId(productId: string): Promise<ProductSize[]> {
  //     const records = await this.prisma.productSize.findMany({
  //       where: { productId },
  //       include: { size: true },
  //     });
  //     return records.map((record) => new ProductSize(record));
  //   }

  //   async findBySizeId(
  //     sizeId: string,
  //     params: PaginationParams
  //   ): Promise<ProductSize[]> {
  //     const { page = 1, pageSize = 10 } = params;
  //     const skip = (page - 1) * pageSize;
  //     const take = pageSize;

  //     const records = await this.prisma.productSize.findMany({
  //       where: { sizeId },
  //       skip,
  //       take,
  //       include: { product: true },
  //     });
  //     return records.map((record) => new ProductSize(record));
  //   }

  //   async delete(productSize: ProductSize): Promise<void> {
  //     await this.prisma.productSize.delete({
  //       where: {
  //         productId: productSize.productId,
  //         sizeId: productSize.sizeId,
  //       },
  //     });
  //   }

  //   async deleteAllByProductId(productId: string): Promise<void> {
  //     await this.prisma.productSize.deleteMany({
  //       where: { productId },
  //     });
  //   }
}
