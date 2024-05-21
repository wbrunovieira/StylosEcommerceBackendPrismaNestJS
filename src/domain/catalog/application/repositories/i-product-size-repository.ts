import { Either } from "@/core/either";
import { ProductSize } from "../../enterprise/entities/product-size";

export interface IProductSizeRepository {
  create(productId: string, sizeId: string): Promise<Either<Error, void>>;
  findByProductId(productId: string): Promise<ProductSize[]>;
   findBySizeId(
    sizeId: string,
   
  ): Promise<ProductSize[]>;
  addItem(ProductSize):void;
  delete(productSize: ProductSize): Promise<void>;
  // deleteAllByProductId(productId: string): Promise<void>;
}
