import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../prisma/prisma.service";

import { IProductCategoryRepository } from "./i-product-category-repository";

@Injectable()
export class PrismaProductCategoryRepository
  implements IProductCategoryRepository
{
  constructor(private prisma: PrismaService) {}

  async create(productId: string, categoryId: string): Promise<void> {
    await this.prisma.productCategory.create({
      data: { productId, categoryId },
    });
  }

  //   async findByProductId(productId: string): Promise<ProductColor[]> {
  //     const records = await this.prisma.productColor.findMany({
  //       where: { productId },
  //       include: { color: true },
  //     });
  //     return records.map((record) => new ProductColor(record));
  //   }

  //   async findByColorId(
  //     colorId: string,
  //     params: PaginationParams
  //   ): Promise<ProductColor[]> {
  //     const { page = 1, pageSize = 10 } = params;
  //     const skip = (page - 1) * pageSize;
  //     const take = pageSize;

  //     const records = await this.prisma.productColor.findMany({
  //       where: { colorId },
  //       skip,
  //       take,
  //       include: { product: true },
  //     });
  //     return records.map((record) => new ProductColor(record));
  //   }

  //   async delete(productColor: ProductColor): Promise<void> {
  //     await this.prisma.productColor.delete({
  //       where: {
  //         productId: productColor.productId,
  //         colorId: productColor.colorId,
  //       },
  //     });
  //   }

  //   async deleteAllByProductId(productId: string): Promise<void> {
  //     await this.prisma.productColor.deleteMany({
  //       where: { productId },
  //     });
  //   }
}
