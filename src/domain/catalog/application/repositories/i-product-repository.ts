import { Product } from "../../enterprise/entities/product";

export interface IProductRepository {
  create(product: Product): Promise<void>;

}
