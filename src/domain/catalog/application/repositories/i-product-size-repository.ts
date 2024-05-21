import { ProductSize } from "../../enterprise/entities/product-size";

export interface IProductSizeRepository {
  create(productId: string, sizeId: string): Promise<void>;
  findByProductId(productId: string): Promise<ProductSize[]>;
   findBySizeId(
    sizeId: string,
   
  ): Promise<ProductSize[]>;
  addItem(ProductSize):void;
  // delete(productSize: ProductSize): Promise<void>;
  // deleteAllByProductId(productId: string): Promise<void>;
}
