import { Injectable } from "@nestjs/common";

import { Either, left, right } from "@/core/either";

import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { IProductRepository } from "@/domain/catalog/application/repositories/i-product-repository";
import { Product } from "@/domain/catalog/enterprise/entities/product";
import { Slug } from "@/domain/catalog/enterprise/entities/value-objects/slug";

@Injectable()
export class InMemoryProductRepository implements IProductRepository {
  public items: Product[] = [];

  private async generateUniqueSlug(
    baseSlug: string,
    productId?: string
  ): Promise<string> {
    let slug = baseSlug;
    let count = 0;
    let existingProduct;

    do {
      existingProduct = this.items.find(
        (item) => item.slug.value === slug && item.id.toString() !== productId
      );

      if (existingProduct) {
        count++;
        slug = `${baseSlug}-${count}`;
      }
    } while (existingProduct);

    return slug;
  }

  findBySlug(slug: string): Promise<Either<Error, Product>> {
    throw new Error("Method not implemented.");
  }

  async save(product: Product): Promise<Either<Error, void>> {
    const index = this.items.findIndex(
      (item) => item.id.toString() === product.id.toString()
    );
    console.log("slug no inmemory antes do generate", product.slug.value);

    const baseSlug = product.slug.value;

    const uniqueSlug = await this.generateUniqueSlug(
      baseSlug,
      product.id.toString()
    );

    product.slug.value = uniqueSlug;

    if (index === -1) {
      this.items.push(product);
    } else {
      this.items[index] = product;
    }

    console.log("slug no inmemory", product.slug.value);

    return right(undefined);
  }

  async findById(productId: string): Promise<Either<Error, Product>> {
    const product = this.items.find((item) => item.id.toString() === productId);
    if (!product) {
      return left(new Error("Product not found"));
    }
    return right(product);
  }

  async create(product: Product): Promise<Either<Error, void>> {
    const existingProduct = this.items.find(
      (item) => item.id.toString() === product.id.toString()
    );
    if (existingProduct) {
      return left(new Error("Product already exists"));
    }

    this.items.push(product);
    return right(undefined);
  }

  async delete(product: Product): Promise<void> {
    this.items = this.items.filter(
      (item) => item.id.toString() !== product.id.toString()
    );
  }
}
