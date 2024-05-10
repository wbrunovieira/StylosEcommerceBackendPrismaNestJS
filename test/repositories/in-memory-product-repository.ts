import { IProductRepository } from "@/domain/catalog/application/repositories/product-repository";
import { Product } from "@/domain/catalog/enterprise/entities/product";

import { generateSlug } from "@/domain/catalog/application/utils/generate-slug";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { InMemoryProductColorRepository } from "./in-memory-product-color-repository";
import { InMemoryProductSizeRepository } from "./in-memory-product-size-repository";
import { InMemoryProductCategoryRepository } from "./in-memory-product-category";

export class InMemoryProductRepository implements IProductRepository {
  private productColorRepository: InMemoryProductColorRepository;
  private productSizeRepository: InMemoryProductSizeRepository;
  private productCategoryRepository: InMemoryProductCategoryRepository;
  public items: Product[] = [];
  public colors: { productId: string; colorId: string }[] = [];
  public sizes: { productId: string; sizeId: string }[] = [];
  public categories: { productId: string; categoryId: string }[] = [];
  public materials: { id: string; material: any }[] = [];
  public brands: { id: string; name: string }[] = [];

  constructor() {
    this.productColorRepository = new InMemoryProductColorRepository();
    this.productSizeRepository = new InMemoryProductSizeRepository();
    this.productCategoryRepository = new InMemoryProductCategoryRepository();
  }

  async create(product: Product): Promise<void> {
    const slug = generateSlug(product.name, "brand");
    product.slug = slug;

    // Push the product into the items array
    this.items.push(product);

    // Link product colors if they exist
    if (product.productColors) {
      product.productColors.forEach(async (colorId) => {
        await this.productColorRepository.create(
          product.id.toString(),
          colorId.toString()
        );
      });
    }

    // Link product sizes if they exist
    if (product.productSizes) {
      product.productSizes.forEach(async (sizeId) => {
        await this.productSizeRepository.create(
          product.id.toString(),
          sizeId.toString()
        );
      });
    }

    // Link product categories if they exist
    if (product.productCategories) {
      product.productCategories.forEach(async (categoryId) => {
        await this.productCategoryRepository.create(
          product.id.toString(),
          categoryId.toString()
        );
      });
    }
  }
}
