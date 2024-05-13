import { Either } from "@/core/either";
import { ProductColor } from "../../enterprise/entities/product-color";

export interface IProductColorRepository {
  create(productId: string, colorId: string): Promise<Either<Error, void>>;
}
