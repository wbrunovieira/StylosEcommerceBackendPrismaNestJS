import { PrismaService } from "../../../../prisma/prisma.service";
import { PaginationParams } from "../../../../core/repositories/pagination-params";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Injectable } from "@nestjs/common";
import { ISizeRepository } from "./i-size-repository";
import { Size } from "../../enterprise/entities/size";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "../use-cases/errors/resource-not-found-error";

@Injectable()
export class PrismaSizeRepository implements ISizeRepository {
  constructor(private prisma: PrismaService) {}

  async create(size: Size): Promise<Either<Error, Size>> {
    try {
      const createdRecord = await this.prisma.size.create({
        data: {
          id: size.id.toString(),
          name: size.name,
          createdAt: size.createdAt,
          updatedAt: size.updatedAt,
        },
      });
      const createdSize = Size.create(
        { name: createdRecord.name },
        new UniqueEntityID(createdRecord.id)
      );
      return right(createdSize);
    } catch (error) {
      return left(new Error("Failed to create size"));
    }
  }

  async findById(id: string): Promise<Either<Error, Size>> {
    try {
      const sizeData = await this.prisma.size.findUnique({
        where: { id },
      });
      if (!sizeData) return left(new ResourceNotFoundError("Size not found"));

      const size = Size.create(
        { name: sizeData.name },
        new UniqueEntityID(sizeData.id)
      );

      return right(size);
    } catch (error) {
      return left(new Error("Database error"));
    }
  }

  async save(size: Size): Promise<Either<Error, void>> {
    try {
      await this.prisma.size.update({
        where: {
          id: size.id.toString(),
        },
        data: {
          name: size.name,
          updatedAt: new Date(),
        },
      });
      return right(undefined);
    } catch (error) {
      return left(new Error("Failed to update size"));
    }
  }

  async delete(size: Size): Promise<Either<Error, void>> {
    try {
      const result = await this.prisma.size.delete({
        where: {
          id: size.id.toString(),
        },
      });
      return right(undefined);
    } catch (error) {
      return left(new Error("Failed to delete size"));
    }
  }

  async findAll(params: PaginationParams): Promise<Either<Error, Size[]>> {
    try {
      const sizes = await this.prisma.size.findMany({
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
      });
      const convertedSizes = sizes.map((b) =>
        Size.create({ name: b.name }, new UniqueEntityID(b.id))
      );
      return right(convertedSizes);
    } catch (error) {
      return left(new Error("Failed to find sizes"));
    }
  }
}
