import { PaginationParams } from "@/core/repositories/pagination-params";
import { Brand } from "../../enterprise/entities/brand";

export interface BrandRepository {
  findById(id: string): Promise<Brand | null>;
  create(brand: Brand): Promise<void>;
  delete(brand: Brand): Promise<void>;
  save(brand: Brand): Promise<void>;
  findAll(params: PaginationParams): Promise<Brand[]>;
}
