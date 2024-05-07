import { PaginationParams } from '@/core/repositories/pagination-params';
import { Brand } from '../../enterprise/entities/brand';

export interface BrandRepository {
  findById(id: string): Promise<Brand | null>;
  create(product: Brand): Promise<void>;
  delete(product: Brand): Promise<void>;
  save(product: Brand): Promise<void>;
  findAll(params: PaginationParams): Promise<Brand[]>;
}
