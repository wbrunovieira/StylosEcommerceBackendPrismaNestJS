import { PaginationParams } from "@/core/repositories/pagination-params";
import { Size } from "../../enterprise/entities/size";

export interface SizeRepository {
  findById(id: string): Promise<Size | null>;
  create(size: Size): Promise<void>;
  delete(size: Size): Promise<void>;
  save(size: Size): Promise<void>;
  findAll(params: PaginationParams): Promise<Size[]>;
}
