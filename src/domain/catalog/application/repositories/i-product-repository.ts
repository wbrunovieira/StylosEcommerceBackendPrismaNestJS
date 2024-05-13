import { Either } from "@/core/either";
import { Product } from "../../enterprise/entities/product";

export interface IProductRepository {
  create(product: Product): Promise<Either<Error, void>>;

}
