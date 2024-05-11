import { PrismaService } from "../../../../prisma/prisma.service";
import { IColorRepository } from "./i-color-repository";
import { Color } from "../../enterprise/entities/color";
import { PaginationParams } from "../../../../core/repositories/pagination-params";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PrismaColorRepository implements IColorRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Color | null> {
    const record = await this.prisma.color.findUnique({
      where: { id },
    });
    return record
      ? Color.create({ name: record.name }, new UniqueEntityID(record.id))
      : null;
  }

  async save(color: Color): Promise<void> {
    await this.prisma.color.update({
      where: { id: color.id.toString() },
      data: {
        name: color.name,
        updatedAt: new Date(),
      },
    });
  }

  async create(color: Color): Promise<void> {
    await this.prisma.color.create({
      data: {
        name: color.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async delete(color: Color): Promise<void> {
    await this.prisma.color.delete({
      where: { id: color.id.toString() },
    });
  }

  async findAll(params: PaginationParams): Promise<Color[]> {
    console.log("params", params);

    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    console.log("Pagination params:", { skip, take });
    const records = await this.prisma.color.findMany({
      skip: skip,
      take: take,
      orderBy: { createdAt: "asc" },
    });
    console.log("skip", skip);
    console.log("take", take);
    console.log("records", records);

    return records.map((record) =>
      Color.create({ name: record.name }, new UniqueEntityID(record.id))
    );
  }
}
