import { ProductColor } from '@/domain/catalog/enterprise/entities/product-color';

import { PaginationParams } from '@/core/repositories/pagination-params';

export class InMemoryProductColorRepository {
  public items: ProductColor[] = [];

  async create(productColor: ProductColor): Promise<void> {
    this.items.push(productColor);
  }

  async findByProductId(productId: string): Promise<ProductColor[]> {
    return this.items.filter((item) => item.productId.toString() === productId);
  }

  async findByColorId(
    colorId: string,
    params: PaginationParams
  ): Promise<ProductColor[]> {
    return this.items.filter((item) => item.colorId.toString() === colorId);
  }

  async delete(productColor: ProductColor): Promise<void> {
    const index = this.items.findIndex((item) => item.equals(productColor));
    if (index !== -1) {
      this.items.splice(index, 1);
    }
  }

  async deleteAllByProductId(productId: string): Promise<void> {
    this.items = this.items.filter(
      (item) => item.productId.toString() !== productId
    );
  }
}
