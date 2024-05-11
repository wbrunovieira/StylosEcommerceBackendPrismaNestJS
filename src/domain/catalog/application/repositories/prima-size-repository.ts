import { PrismaService } from "../../../../prisma/prisma.service";
import { PaginationParams } from "../../../../core/repositories/pagination-params";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Injectable } from "@nestjs/common";
import { SizeRepository } from "./i-size-repository";
import { Size } from "../../enterprise/entities/size";

@Injectable()
export class PrismaSizeRepository implements SizeRepository {
  constructor(private prisma: PrismaService) {}

  async create(size: Size): Promise<void> {
    await this.prisma.size.create({
      data: {
        name: size.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async findById(id: string): Promise<Size | null> {
    const record = await this.prisma.size.findUnique({
      where: { id },
    });
    return record
      ? Size.create({ name: record.name }, new UniqueEntityID(record.id))
      : null;
  }

  async save(size: Size): Promise<void> {
    await this.prisma.size.update({
      where: { id: size.id.toString() },
      data: {
        name: size.name,
        updatedAt: new Date(),
      },
    });
  }

  async delete(size: Size): Promise<void> {
    await this.prisma.size.delete({
      where: { id: size.id.toString() },
    });
  }

  async findAll(params: PaginationParams): Promise<Size[]> {
    console.log("params", params);

    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    console.log("Pagination params:", { skip, take });
    const records = await this.prisma.size.findMany({
      skip: skip,
      take: take,
      orderBy: { createdAt: "asc" },
    });
    console.log("skip", skip);
    console.log("take", take);
    console.log("records", records);

    return records.map((record) =>
      Size.create({ name: record.name }, new UniqueEntityID(record.id))
    );
  }
}
