import { PrismaService } from "../../../../prisma/prisma.service";

import { PaginationParams } from "../../../../core/repositories/pagination-params";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Injectable } from "@nestjs/common";

import { ICategoryRepository } from "./i-category-repository";
import { Category } from "../../enterprise/entities/category";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "../use-cases/errors/resource-not-found-error";

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

@Injectable()
export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(private prisma: PrismaService) {}
  addItems(...categories: Category[]): void {
    throw new Error("Method not implemented.");
  }

  async findById(id: string): Promise<Either<Error, Category>> {
    try {
      const categoryData = await this.prisma.category.findUnique({
        where: { id },
      });
      if (!categoryData)
        return left(new ResourceNotFoundError("Category not found"));

      const category = Category.create(
        { name: categoryData.name },
        new UniqueEntityID(categoryData.id)
      );

      return right(category);
    } catch (error) {
      return left(new Error("Database error"));
    }
  }

  async save(category: Category): Promise<Either<Error, void>> {
    try {
      await this.prisma.category.update({
        where: {
          id: category.id.toString(),
        },
        data: {
          name: category.name,
          updatedAt: new Date(),
        },
      });
      return right(undefined);
    } catch (error) {
      return left(new Error("Failed to update category"));
    }
  }

  async create(category: Category): Promise<Either<Error, void>> {
    try {
      await this.prisma.category.create({
        data: {
          id: category.id.toString(),
          name: category.name,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
        },
      });
      return right(undefined);
    } catch (error) {
      return left(new Error("Failed to create category"));
    }
  }

  async delete(category: Category): Promise<Either<Error, void>> {
    try {
      const result = await this.prisma.category.delete({
        where: {
          id: category.id.toString(),
        },
      });
      return right(undefined);
    } catch (error) {
      return left(new Error("Failed to delete category"));
    }
  }

  async findByName(name: string): Promise<Either<Error, Category>> {
    const normalizedName = normalizeName(name);
    try {
      const categoryData = await this.prisma.category.findFirst({
        where: { name: normalizedName },
      });

      if (!categoryData)
        return left(new ResourceNotFoundError("Category not found"));

      const category = Category.create(
        { name: categoryData.name },
        new UniqueEntityID(categoryData.id)
      );

      return right(category);
    } catch (error) {
      return left(new Error("Database error"));
    }
  }

  async findAll(params: PaginationParams): Promise<Either<Error, Category[]>> {
    try {
      
      const category = await this.prisma.category.findMany({
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
      });
      
      const convertedCategory = category.map((b) =>
        Category.create({ name: b.name }, new UniqueEntityID(b.id))
      );
      
      return right(convertedCategory);
    } catch (error) {
      
      return left(new Error("Failed to find categories"));
    }
  }
}
