import { PaginationParams } from "@/core/repositories/pagination-params";
import { Brand } from "../../enterprise/entities/brand";
import { Either } from "@/core/either";

export interface IBrandRepository {
  findById(id: string): Promise<Either<Error, Brand>>;
  create(brand: Brand): Promise<Either<Error, void>>;
  delete(brand: Brand): Promise<Either<Error, void>>;
  save(brand: Brand): Promise<Either<Error, void>>;
  findAll(params: PaginationParams): Promise<Either<Error, Brand[]>>;
}
