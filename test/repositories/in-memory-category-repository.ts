import { PaginationParams } from "@/core/repositories/pagination-params";

import { ICategoryRepository } from "@/domain/catalog/application/repositories/i-category-repository";

import { Category } from "@/domain/catalog/enterprise/entities/category";

export class InMemoryCategoryRepository implements ICategoryRepository {
  async findAll({ page }: PaginationParams): Promise<Category[]> {
    const sortedItems = this.items.sort((a, b) => a.name.localeCompare(b.name));

    const startIndex = (page - 1) * 20;
    const endIndex = startIndex + 20;
    return sortedItems.slice(startIndex, endIndex);
  }

  async save(category: Category) {
    const itemIndex = this.items.findIndex((item) => item.id === category.id);
    if (itemIndex >= 0) {
      this.items[itemIndex] = category;
    } else {
      console.log("erro to save category");
    }
  }
  async findById(id: string) {
    const category = this.items.find((item) => item.id.toString() === id);

    if (!category) {
      return null;
    }

    return category;
  }

  async delete(category: Category) {
    const itemIndex = this.items.findIndex((item) => item.id === category.id);

    this.items.splice(itemIndex, 1);
  }
  public items: Category[] = [];

  async create(category: Category) {
    this.items.push(category);
  }
}
