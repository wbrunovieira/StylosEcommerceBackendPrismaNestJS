import { PaginationParams } from "@/core/repositories/pagination-params";
import { Product } from "../../enterprise/entities/product";

export interface ProductRepository {
  create(product: Product): Promise<void>;
  // findById(id: string): Promise<Product | null>;
  // findManyRecent(params: PaginationParams): Promise<Product[]>;
  // findBySlug(slug: string): Promise<Product | null>;
  // delete(product: Product): Promise<void>;
  // save(product: Product): Promise<void>;
}
