import { PaginationParams } from "@/core/repositories/pagination-params";
import { Category } from "../../enterprise/entities/category";

export interface ICategoryRepository {
  findById(id: string): Promise<Category | null>;
  create(category: Category): Promise<void>;
  delete(category: Category): Promise<void>;
  save(category: Category): Promise<void>;
  findAll(params: PaginationParams): Promise<Category[]>;
}
