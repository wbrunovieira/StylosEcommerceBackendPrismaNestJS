import { PrismaService } from "../../../../prisma/prisma.service";

import { PaginationParams } from "../../../../core/repositories/pagination-params";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Injectable } from "@nestjs/common";

import { ICategoryRepository } from "./i-category-repository";
import { Category } from "../../enterprise/entities/category";

@Injectable()
export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Category | null> {
    const record = await this.prisma.category.findUnique({
      where: { id },
    });
    return record
      ? Category.create({ name: record.name }, new UniqueEntityID(record.id))
      : null;
  }

  async save(category: Category): Promise<void> {
    await this.prisma.category.update({
      where: { id: category.id.toString() },
      data: {
        name: category.name,
        updatedAt: new Date(),
      },
    });
  }

  async create(category: Category): Promise<void> {
    await this.prisma.category.create({
      data: {
        name: category.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async delete(category: Category): Promise<void> {
    await this.prisma.category.delete({
      where: { id: category.id.toString() },
    });
  }

  async findAll(params: PaginationParams): Promise<Category[]> {
    console.log("params", params);

    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    console.log("Pagination params:", { skip, take });
    const records = await this.prisma.category.findMany({
      skip: skip,
      take: take,
      orderBy: { createdAt: "asc" },
    });
    console.log("skip", skip);
    console.log("take", take);
    console.log("records", records);

    return records.map((record) =>
      Category.create({ name: record.name }, new UniqueEntityID(record.id))
    );
  }
}
