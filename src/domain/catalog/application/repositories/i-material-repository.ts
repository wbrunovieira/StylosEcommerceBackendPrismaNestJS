import { PaginationParams } from "@/core/repositories/pagination-params";
import { Material } from "../../enterprise/entities/material";
import { Either } from "@/core/either";

export interface IMaterialRepository {
  findById(id: string): Promise<Either<Error, Material>>;
  create(product: Material): Promise<Either<Error, void>>;
  delete(product: Material): Promise<Either<Error, void>>;
  save(product: Material): Promise<Either<Error, void>>;
  findAll(params: PaginationParams): Promise<Either<Error, Material[]>>;
}
