import { PaginationParams } from '@/core/repositories/pagination-params';
import { ProductRepository } from '@/domain/catalog/application/repositories/product-repository';
import { Product } from '@/domain/catalog/enterprise/entities/product';

export class InMemoryProductRepository implements ProductRepository {
  async save(product: Product) {
    const itemIndex = this.items.findIndex((item) => item.id === product.id);
    if (itemIndex >= 0) {
      this.items[itemIndex] = product;
    } else {
      console.log('erro to save product');
    }
  }
  public items: Product[] = [];

  async create(product: Product) {
    this.items.push(product);
  }

  async findManyRecent({ page }: PaginationParams) {
    const product = this.items
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice((page - 1) * 20, page * 20);

    return product;
  }

  async findBySlug(slug: string) {
    const product = this.items.find((item) => item.slug.value === slug);

    if (!product) {
      return null;
    }

    return product;
  }

  async findById(id: string) {
    const product = this.items.find((item) => item.id.toString() === id);

    if (!product) {
      return null;
    }

    return product;
  }

  async delete(product: Product) {
    const itemIndex = this.items.findIndex((item) => item.id === product.id);

    this.items.splice(itemIndex, 1);
  }
}
