import { Either } from "@/core/either";
import { ProductCategory } from "../../enterprise/entities/product-category";

export interface IProductCategoryRepository {
  create(productId: string, categoryId: string): Promise<Either<Error, void>>;
  findByProductId(productId: string): Promise<ProductCategory[]>;
  findByCategoyId(
    ColorId: string,
   
  ): Promise<ProductCategory[]>;
  addItem(productcategory):void;
  delete(productcategory: ProductCategory): Promise<void>;
}
