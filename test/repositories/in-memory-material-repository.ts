import { PaginationParams } from '@/core/repositories/pagination-params';
import { MaterialRepository } from '@/domain/catalog/application/repositories/material-repository';

import { Material } from '@/domain/catalog/enterprise/entities/material';

export class InMemoryMaterialRepository implements MaterialRepository {
  async findAll({ page }: PaginationParams): Promise<Material[]> {
    const sortedItems = this.items.sort((a, b) => a.name.localeCompare(b.name));

    const startIndex = (page - 1) * 20;
    const endIndex = startIndex + 20;
    return sortedItems.slice(startIndex, endIndex);
  }

  async save(material: Material) {
    const itemIndex = this.items.findIndex((item) => item.id === material.id);
    if (itemIndex >= 0) {
      this.items[itemIndex] = material;
    } else {
      console.log('erro to save material');
    }
  }
  async findById(id: string) {
    const material = this.items.find((item) => item.id.toString() === id);

    if (!material) {
      return null;
    }

    return material;
  }

  async delete(material: Material) {
    const itemIndex = this.items.findIndex((item) => item.id === material.id);

    this.items.splice(itemIndex, 1);
  }
  public items: Material[] = [];

  async create(material: Material) {
    this.items.push(material);
  }
}
