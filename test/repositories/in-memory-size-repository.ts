import { PaginationParams } from '@/core/repositories/pagination-params';
import { SizeRepository } from '@/domain/catalog/application/repositories/size-repository';

import { Size } from '@/domain/catalog/enterprise/entities/size';

export class InMemorySizeRepository implements SizeRepository {
  async findAll({ page }: PaginationParams): Promise<Size[]> {
    const sortedItems = this.items.sort((a, b) => a.name.localeCompare(b.name));

    const startIndex = (page - 1) * 20;
    const endIndex = startIndex + 20;
    return sortedItems.slice(startIndex, endIndex);
  }

  async save(size: Size) {
    const itemIndex = this.items.findIndex((item) => item.id === size.id);
    if (itemIndex >= 0) {
      this.items[itemIndex] = size;
    } else {
      console.log('erro to save size');
    }
  }
  async findById(id: string) {
    const size = this.items.find((item) => item.id.toString() === id);

    if (!size) {
      return null;
    }

    return size;
  }

  async delete(size: Size) {
    const itemIndex = this.items.findIndex((item) => item.id === size.id);

    this.items.splice(itemIndex, 1);
  }
  public items: Size[] = [];

  async create(size: Size) {
    this.items.push(size);
  }
}
