import { PaginationParams } from "@/core/repositories/pagination-params";
import { Material } from "../../enterprise/entities/material";
import { Either } from "@/core/either";import { PrismaMaterialRepository } from "./prisma-material-repository";
PrismaMaterialRepository

export abstract class IMaterialRepository {
  abstract create(material: Material): Promise<Either<Error, void>>;
  abstract findById(id: string): Promise<Either<Error, Material>>;
  abstract findByName(name: string): Promise<Either<Error, Material>>;
  abstract findAll(params: PaginationParams): Promise<Either<Error, Material[]>>;
  abstract save(material: Material): Promise<Either<Error, void>>;
  abstract delete(material: Material): Promise<Either<Error, void>>;
}
