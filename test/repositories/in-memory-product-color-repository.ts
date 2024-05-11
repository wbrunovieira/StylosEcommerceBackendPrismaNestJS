import { ProductColor } from "@/domain/catalog/enterprise/entities/product-color";

import { IProductColorRepository } from "@/domain/catalog/application/repositories/i-product-color-repository";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

export class InMemoryProductColorRepository implements IProductColorRepository {
  public items: ProductColor[] = [];

  async create(productId: string, colorId: string): Promise<void> {
    const productIdUnique = new UniqueEntityID(productId);
    const colorIdUnique = new UniqueEntityID(colorId);

    const productColor = new ProductColor({
      productId: productIdUnique,
      colorId: colorIdUnique,
    });

    this.items.push(productColor);
  }

  // async findByProductId(productId: string): Promise<ProductColor[]> {
  //   return this.items.filter((item) => item.productId.toString() === productId);
  // }

  // async findByColorId(
  //   colorId: string,
  //   params: PaginationParams
  // ): Promise<ProductColor[]> {
  //   return this.items.filter((item) => item.colorId.toString() === colorId);
  // }

  // async delete(productColor: ProductColor): Promise<void> {
  //   const index = this.items.findIndex((item) => item.equals(productColor));
  //   if (index !== -1) {
  //     this.items.splice(index, 1);
  //   }
  // }

  // async deleteAllByProductId(productId: string): Promise<void> {
  //   this.items = this.items.filter(
  //     (item) => item.productId.toString() !== productId
  //   );
  // }
}
