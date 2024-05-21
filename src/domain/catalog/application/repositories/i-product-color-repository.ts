import { Either } from "@/core/either";
import { ProductColor } from "../../enterprise/entities/product-color";

export interface IProductColorRepository {
  create(productId: string, colorId: string): Promise<Either<Error, void>>;
  findByProductId(productId: string): Promise<ProductColor[]>;
  findByColorId(
   ColorId: string,
  
 ): Promise<ProductColor[]>;
 addItem(ProductColor):void;
 delete(productColor: ProductColor): Promise<void>;
}
