import { PrismaService } from "../../../../prisma/prisma.service";

import { PaginationParams } from "../../../../core/repositories/pagination-params";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Injectable } from "@nestjs/common";

import { IMaterialRepository } from "./i-material-repository";
import { Material } from "../../enterprise/entities/material";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "../use-cases/errors/resource-not-found-error";

@Injectable()
export class PrismaMaterialRepository implements IMaterialRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Either<Error, Material>> {
    try {
      const materialData = await this.prisma.material.findUnique({
        where: { id },
      });
      if (!materialData)
        return left(new ResourceNotFoundError("Material not found"));

      const material = Material.create(
        { name: materialData.name },
        new UniqueEntityID(materialData.id)
      );

      return right(material);
    } catch (error) {
      return left(new Error("Database error"));
    }
  }

  async save(material: Material): Promise<Either<Error, void>> {
    try {
      await this.prisma.material.update({
        where: {
          id: material.id.toString(),
        },
        data: {
          name: material.name,
          updatedAt: new Date(),
        },
      });
      return right(undefined);
    } catch (error) {
      return left(new Error("Failed to update brand"));
    }
  }

  async create(material: Material): Promise<Either<Error, void>> {
    try {
      await this.prisma.material.create({
        data: {
          id: material.id.toString(),
          name: material.name,
          createdAt: material.createdAt,
          updatedAt: material.updatedAt,
        },
      });
      return right(undefined);
    } catch (error) {
      return left(new Error("Failed to create material"));
    }
  }

  async delete(material: Material): Promise<Either<Error, void>> {
    try {
      const result = await this.prisma.material.delete({
        where: {
          id: material.id.toString(),
        },
      });
      return right(undefined);
    } catch (error) {
      return left(new Error("Failed to delete brand"));
    }
  }

  async findAll(params: PaginationParams): Promise<Either<Error, Material[]>> {
    try {
      const materials = await this.prisma.material.findMany({
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
      });
      const convertedMaterials = materials.map((b) =>
        Material.create({ name: b.name }, new UniqueEntityID(b.id))
      );
      return right(convertedMaterials);
    } catch (error) {
      return left(new Error("Failed to find material"));
    }
  }
}
