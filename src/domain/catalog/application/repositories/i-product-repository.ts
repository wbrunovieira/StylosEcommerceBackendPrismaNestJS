import { Either } from "@/core/either";
import { Product } from "../../enterprise/entities/product";

export abstract class IProductRepository {
  abstract create(product: Product): Promise<Either<Error, void>>;

  abstract delete(product: Product): Promise<void>;
  abstract findById(productId: string): Promise<Either<Error, Product>>; 
  abstract save(product: Product): Promise<Either<Error, void>>;
}
