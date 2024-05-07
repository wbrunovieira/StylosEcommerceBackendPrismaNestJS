import { PaginationParams } from '@/core/repositories/pagination-params';
import { Size } from '../../enterprise/entities/size';

export interface SizeRepository {
  findById(id: string): Promise<Size | null>;
  create(product: Size): Promise<void>;
  delete(product: Size): Promise<void>;
  save(product: Size): Promise<void>;
  findAll(params: PaginationParams): Promise<Size[]>;
}
