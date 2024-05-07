import { PaginationParams } from '@/core/repositories/pagination-params';
import { Material } from '../../enterprise/entities/material';

export interface MaterialRepository {
  findById(id: string): Promise<Material | null>;
  create(product: Material): Promise<void>;
  delete(product: Material): Promise<void>;
  save(product: Material): Promise<void>;
  findAll(params: PaginationParams): Promise<Material[]>;
}
