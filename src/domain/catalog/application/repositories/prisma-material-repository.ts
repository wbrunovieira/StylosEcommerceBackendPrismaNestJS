import { PrismaService } from "../../../../prisma/prisma.service";

import { PaginationParams } from "../../../../core/repositories/pagination-params";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Injectable } from "@nestjs/common";

import { IMaterialRepository } from "./i-material-repository";
import { Material } from "../../enterprise/entities/material";

@Injectable()
export class PrismaMaterialRepository implements IMaterialRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Material | null> {
    const record = await this.prisma.material.findUnique({
      where: { id },
    });
    return record
      ? Material.create({ name: record.name }, new UniqueEntityID(record.id))
      : null;
  }

  async save(material: Material): Promise<void> {
    await this.prisma.material.update({
      where: { id: material.id.toString() },
      data: {
        name: material.name,
        updatedAt: new Date(),
      },
    });
  }

  async create(material: Material): Promise<void> {
    await this.prisma.material.create({
      data: {
        name: material.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async delete(material: Material): Promise<void> {
    await this.prisma.material.delete({
      where: { id: material.id.toString() },
    });
  }

  async findAll(params: PaginationParams): Promise<Material[]> {
    console.log("params", params);

    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    console.log("Pagination params:", { skip, take });
    const records = await this.prisma.material.findMany({
      skip: skip,
      take: take,
      orderBy: { createdAt: "asc" },
    });
    console.log("skip", skip);
    console.log("take", take);
    console.log("records", records);

    return records.map((record) =>
      Material.create({ name: record.name }, new UniqueEntityID(record.id))
    );
  }
}
