import { ProductSize } from "@/domain/catalog/enterprise/entities/product-size";

import { IProductSizeRepository } from "@/domain/catalog/application/repositories/i-product-size-repository";

import { UniqueEntityID } from "@/core/entities/unique-entity-id";

export class InMemoryProductSizeRepository implements IProductSizeRepository {
  public items: ProductSize[] = [];

  async create(productId: string, sizeId: string): Promise<void> {
    const productIdUnique = new UniqueEntityID(productId);
    const sizeIdUnique = new UniqueEntityID(sizeId);

    const productSize = new ProductSize({
      productId: productIdUnique,
      sizeId: sizeIdUnique,
    });

    this.items.push(productSize);
  }

  async findByProductId(productId: string): Promise<ProductSize[]> {
    return this.items.filter(item => item.productId.toString() === productId);
  }

  async findBySizeId(sizeId: string): Promise<ProductSize[]> {
    return this.items.filter(item => item.sizeId.toString() === sizeId);
  }
  // findByProductId(productId: string): Promise<ProductSize[]> {
  //   throw new Error('Method not implemented.');
  // }
  // findBySizeId(
  //   sizeId: string,
  //   params: PaginationParams
  // ): Promise<ProductSize[]> {
  //   throw new Error('Method not implemented.');
  // }

  // delete(productSize: ProductSize): Promise<void> {
  //   throw new Error('Method not implemented.');
  // }
  // deleteAllByProductId(productId: string): Promise<void> {
  //   throw new Error('Method not implemented.');
  // }
  // findById(id: string): Promise<Size> {
  //   throw new Error('Method not implemented.');
  // }
}
