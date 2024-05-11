import { ProductCategory } from "@/domain/catalog/enterprise/entities/product-category";

import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { IProductCategoryRepository } from "@/domain/catalog/application/repositories/i-product-category-repository";

export class InMemoryProductCategoryRepository
  implements IProductCategoryRepository
{
  public items: ProductCategory[] = [];

  async create(productId: string, categoryId: string): Promise<void> {
    const productIdUnique = new UniqueEntityID(productId);
    const colorIdUnique = new UniqueEntityID(categoryId);

    const productColor = new ProductCategory({
      productId: productIdUnique,
      categoryId: colorIdUnique,
    });

    this.items.push(productColor);
  }
}
