import { Either, left, right } from "@/core/either";
import { PaginationParams } from "@/core/repositories/pagination-params";

import { ICategoryRepository } from "@/domain/catalog/application/repositories/i-category-repository";

import { Category } from "@/domain/catalog/enterprise/entities/category";

export class InMemoryCategoryRepository implements ICategoryRepository {
  public items: Category[] = [];

  async findAll(params: PaginationParams): Promise<Either<Error, Category[]>> {
    try {
      const { page, pageSize } = params;
      const startIndex = (page - 1) * pageSize;
      const paginatedItems = this.items.slice(
        startIndex,
        startIndex + pageSize
      );
      return right(paginatedItems);
    } catch (error) {
      return left(new Error("Failed to find category"));
    }
  }

  async save(category: Category): Promise<Either<Error, void>> {
    const index = this.items.findIndex(
      (b) => b.id.toString() === category.id.toString()
    );
    if (index === -1) {
      return left(new Error("Category not found"));
    }
    this.items[index] = category;
    return right(undefined);
  }

  async findById(id: string): Promise<Either<Error, Category>> {
    const category = this.items.find((item) => item.id.toString() === id);

    if (!category) {
      return left(new Error("Category not found"));
    }
    return right(category);
  }

  async delete(category: Category): Promise<Either<Error, void>> {
    const index = this.items.findIndex(
      (b) => b.id.toString() === category.id.toString()
    );
    if (index === -1) {
      return left(new Error("Category not found"));
    }
    this.items.splice(index, 1);
    return right(undefined);
  }

  async create(category: Category): Promise<Either<Error, void>> {
    const existing = this.items.find(
      (b) => b.id.toString() === category.id.toString()
    );
    if (existing) {
      return left(new Error("Category already exists"));
    }
    this.items.push(category);
    return right(undefined);
  }
}
