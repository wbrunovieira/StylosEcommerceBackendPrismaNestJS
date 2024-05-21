import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../prisma/prisma.service";

import { IProductCategoryRepository } from "./i-product-category-repository";
import { Either } from "@/core/either";
import { ProductCategory } from "../../enterprise/entities/product-category";

@Injectable()
export class PrismaProductCategoryRepository
  implements IProductCategoryRepository
{
  constructor(private prisma: PrismaService) {}
  create(productId: string, categoryId: string): Promise<Either<Error, void>> {
    throw new Error("Method not implemented.");
  }
  findByProductId(productId: string): Promise<ProductCategory[]> {
    throw new Error("Method not implemented.");
  }
  findByCategoyId(ColorId: string): Promise<ProductCategory[]> {
    throw new Error("Method not implemented.");
  }
  addItem(productcategory: any): void {
    throw new Error("Method not implemented.");
  }
  delete(productcategory: ProductCategory): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
