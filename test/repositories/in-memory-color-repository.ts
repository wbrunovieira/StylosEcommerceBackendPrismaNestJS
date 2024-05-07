import { PaginationParams } from '@/core/repositories/pagination-params';
import { ColorRepository } from '@/domain/catalog/application/repositories/color-repository';

import { Color } from '@/domain/catalog/enterprise/entities/color';

export class InMemoryColorRepository implements ColorRepository {
  async findAll({ page }: PaginationParams): Promise<Color[]> {
    const sortedItems = this.items.sort((a, b) => a.name.localeCompare(b.name));

    const startIndex = (page - 1) * 20;
    const endIndex = startIndex + 20;
    return sortedItems.slice(startIndex, endIndex);
  }

  async save(color: Color) {
    const itemIndex = this.items.findIndex((item) => item.id === color.id);
    if (itemIndex >= 0) {
      this.items[itemIndex] = color;
    } else {
      console.log('erro to save color');
    }
  }
  async findById(id: string) {
    const color = this.items.find((item) => item.id.toString() === id);

    if (!color) {
      return null;
    }

    return color;
  }

  async delete(color: Color) {
    const itemIndex = this.items.findIndex((item) => item.id === color.id);

    this.items.splice(itemIndex, 1);
  }
  public items: Color[] = [];

  async create(color: Color) {
    this.items.push(color);
  }
}
