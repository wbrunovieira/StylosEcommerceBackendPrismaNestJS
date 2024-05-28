import { Injectable } from "@nestjs/common";

import { Either, left, right } from "@/core/either";

import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { IProductRepository } from "@/domain/catalog/application/repositories/i-product-repository";
import { Product } from "@/domain/catalog/enterprise/entities/product";

@Injectable()
export class InMemoryProductRepository implements IProductRepository {
  public items: Product[] = [];

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
