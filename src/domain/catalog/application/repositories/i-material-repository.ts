import { PaginationParams } from "@/core/repositories/pagination-params";
import { Material } from "../../enterprise/entities/material";
import { Either } from "@/core/either";

export abstract class IMaterialRepository {
  abstract findById(id: string): Promise<Either<Error, Material>>;
  abstract create(material: Material): Promise<Either<Error, void>>;
  abstract delete(material: Material): Promise<Either<Error, void>>;
  abstract save(material: Material): Promise<Either<Error, void>>;
  abstract findAll(params: PaginationParams): Promise<Either<Error, Material[]>>;
}
