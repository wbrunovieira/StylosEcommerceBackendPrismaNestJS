import { PaginationParams } from "@/core/repositories/pagination-params";
import { Category } from "../../enterprise/entities/category";

export abstract class ICategoryRepository {
  abstract findById(id: string): Promise<Category | null>;
  abstract create(category: Category): Promise<void>;
  abstract delete(category: Category): Promise<void>;
  abstract save(category: Category): Promise<void>;
  abstract findAll(params: PaginationParams): Promise<Category[]>;
}
