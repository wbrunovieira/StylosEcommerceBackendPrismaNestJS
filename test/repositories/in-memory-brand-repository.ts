import { PaginationParams } from '@/core/repositories/pagination-params';
import { BrandRepository } from '@/domain/catalog/application/repositories/brand-repository';

import { Brand } from '@/domain/catalog/enterprise/entities/brand';

export class InMemoryBrandRepository implements BrandRepository {
  async findAll({ page }: PaginationParams): Promise<Brand[]> {
    const sortedItems = this.items.sort((a, b) => a.name.localeCompare(b.name));

    const startIndex = (page - 1) * 20;
    const endIndex = startIndex + 20;
    return sortedItems.slice(startIndex, endIndex);
  }

  async save(brand: Brand) {
    const itemIndex = this.items.findIndex((item) => item.id === brand.id);
    if (itemIndex >= 0) {
      this.items[itemIndex] = brand;
    } else {
      console.log('erro to save brand');
    }
  }
  async findById(id: string) {
    const brand = this.items.find((item) => item.id.toString() === id);

    if (!brand) {
      return null;
    }

    return brand;
  }

  async delete(brand: Brand) {
    const itemIndex = this.items.findIndex((item) => item.id === brand.id);

    this.items.splice(itemIndex, 1);
  }
  public items: Brand[] = [];

  async create(brand: Brand) {
    this.items.push(brand);
  }
}
