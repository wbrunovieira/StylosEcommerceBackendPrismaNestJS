import { PaginationParams } from "@/core/repositories/pagination-params";
import { Brand } from "../../enterprise/entities/brand";
import { Either } from "@/core/either";

export abstract class IBrandRepository {
  abstract create(brand: Brand): Promise<Either<Error, void>>;
  abstract findById(id: string): Promise<Either<Error, Brand>>;
  abstract findByName(name: string): Promise<Either<Error, Brand>>;
  abstract delete(brand: Brand): Promise<Either<Error, void>>;
  abstract save(brand: Brand): Promise<Either<Error, void>>;
  abstract findAll(params: PaginationParams): Promise<Either<Error, Brand[]>>;
}
