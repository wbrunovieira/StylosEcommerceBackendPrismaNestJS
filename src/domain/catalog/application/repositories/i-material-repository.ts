import { PaginationParams } from "@/core/repositories/pagination-params";
import { Material } from "../../enterprise/entities/material";
import { Either } from "@/core/either";

export interface IMaterialRepository {
  findById(id: string): Promise<Either<Error, Material>>;
  create(material: Material): Promise<Either<Error, void>>;
  delete(material: Material): Promise<Either<Error, void>>;
  save(material: Material): Promise<Either<Error, void>>;
  findAll(params: PaginationParams): Promise<Either<Error, Material[]>>;
}
