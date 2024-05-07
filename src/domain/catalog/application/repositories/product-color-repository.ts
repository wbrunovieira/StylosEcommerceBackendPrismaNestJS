import { PaginationParams } from '@/core/repositories/pagination-params';
import { ProductColor } from '../../enterprise/entities/product-color';

export interface ProductColorRepository {
  findByProductId(productId: string): Promise<ProductColor[]>;
  findByColorId(
    colorId: string,
    params: PaginationParams
  ): Promise<ProductColor[]>;
  create(productColor: ProductColor): Promise<void>;
  delete(productColor: ProductColor): Promise<void>;
  deleteAllByProductId(productId: string): Promise<void>;
}
