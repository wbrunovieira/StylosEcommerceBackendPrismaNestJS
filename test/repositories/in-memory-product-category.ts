import { ProductCategory } from "@/domain/catalog/enterprise/entities/product-category";

import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { IProductCategoryRepository } from "@/domain/catalog/application/repositories/i-product-category-repository";
import { Either, right } from "@/core/either";

export class InMemoryProductCategoryRepository
  implements IProductCategoryRepository
{
  public items: ProductCategory[] = [];

  async create(
    productId: string,
    categoryId: string
  ): Promise<Either<Error, void>> {
    const productIdUnique = new UniqueEntityID(productId);
    const categoryIdUnique = new UniqueEntityID(categoryId);

    const productCategory = new ProductCategory({
      productId: productIdUnique,
      categoryId: categoryIdUnique,
    });

    this.items.push(productCategory);
    return right(undefined);
  }

  async findByProductId(productId: string): Promise<ProductCategory[]> {
    return this.items.filter((item) => item.productId.toString() === productId);
  }

  async findByCategoyId(categoryId: string): Promise<ProductCategory[]> {
    return this.items.filter(
      (item) => item.categoryId.toString() === categoryId
    );
  }

  async addItem(productCategory: ProductCategory): Promise<void> {
    this.items.push(productCategory);
  }
  async delete(productCategory: ProductCategory): Promise<void> {
    this.items = this.items.filter(
      (item) =>
        item.productId.toString() !== productCategory.productId.toString() ||
        item.categoryId.toString() !== productCategory.categoryId.toString()
    );
  }
  async deleteAllByProductId(productId: string): Promise<void> {
    this.items = this.items.filter(
      (item) => item.productId.toString() !== productId
    );
  }
}
