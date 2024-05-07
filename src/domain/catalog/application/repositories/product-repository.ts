import { PaginationParams } from '@/core/repositories/pagination-params';
import { Product } from '../../enterprise/entities/product';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ProductColor } from '../../enterprise/entities/product-color';

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findManyRecent(params: PaginationParams): Promise<Product[]>;
  create(product: Product): Promise<void>;
  findBySlug(slug: string): Promise<Product | null>;
  delete(product: Product): Promise<void>;
  save(product: Product): Promise<void>;
}
