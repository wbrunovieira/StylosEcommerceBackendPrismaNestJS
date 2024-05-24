import { IProductRepository } from "@/domain/catalog/application/repositories/i-product-repository";
import { Product } from "@/domain/catalog/enterprise/entities/product";

import { generateSlug } from "@/domain/catalog/application/utils/generate-slug";

import { InMemoryProductColorRepository } from "./in-memory-product-color-repository";
import { InMemoryProductSizeRepository } from "./in-memory-product-size-repository";

import { Either, left, right } from "@/core/either";
import { Injectable } from "@nestjs/common";

@Injectable()
export class InMemoryProductRepository implements IProductRepository {
  private productColorRepository: InMemoryProductColorRepository;
  private productSizeRepository: InMemoryProductSizeRepository;

  public items: Product[] = [];
  public colors: { productId: string; colorId: string }[] = [];
  public sizes: { productId: string; sizeId: string }[] = [];
  public categories: { productId: string; categoryId: string }[] = [];
  public materials: { id: string; material: any }[] = [];
  public brands: { id: string; name: string }[] = [];

  constructor() {
    this.productColorRepository = new InMemoryProductColorRepository();
    this.productSizeRepository = new InMemoryProductSizeRepository();
  }
  async findById(productId: string): Promise<Either<Error, Product>> {
    const product = this.items.find((item) => item.id.toString() === productId);
   
    if (!product) {
      return left(new Error("Product not found"));
    }
    return right(product);
  }
 

  async create(product: Product): Promise<Either<Error, void>> {
    const slug = generateSlug(product.name, "brand");
    product.slug = slug;

    this.items.push(product);

    if (product.productColors) {
      product.productColors.forEach(async (colorId) => {
        await this.productColorRepository.create(
          product.id.toString(),
          colorId.toString()
        );
      });
    }

    if (product.productSizes) {
      product.productSizes.forEach(async (sizeId) => {
        await this.productSizeRepository.create(
          product.id.toString(),
          sizeId.toString()
        );
      });
    }

    return right(undefined);
  }

  async delete(product: Product): Promise<void> {
    this.items = this.items.filter(
      (item) => item.id.toString() !== product.id.toString()
    );
    await this.productSizeRepository.deleteAllByProductId(
      product.id.toString()
    );
    // await this.productColors.deleteAllByProductId(
    //   product.id.toString()
    // );
  }
}
