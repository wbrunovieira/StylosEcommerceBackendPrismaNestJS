import { PaginationParams } from "@/core/repositories/pagination-params";
import { Size } from "../../enterprise/entities/size";

export interface SizeRepository {
  create(size: Size): Promise<void>;
  // findById(id: string): Promise<Size | null>;
  // delete(size: Size): Promise<void>;
  // save(size: Size): Promise<void>;
  // findAll(params: PaginationParams): Promise<Size[]>;
}
