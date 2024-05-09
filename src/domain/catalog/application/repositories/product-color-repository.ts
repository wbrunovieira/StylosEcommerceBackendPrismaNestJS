import { PaginationParams } from '@/core/repositories/pagination-params';
import { ProductColor } from '../../enterprise/entities/product-color';

export interface ProductColorRepository {
  create(productId: string, colorId: string): Promise<void>;
 
}
