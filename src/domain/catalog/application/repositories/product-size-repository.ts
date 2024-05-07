import { PaginationParams } from '@/core/repositories/pagination-params';
import { ProductSize } from '../../enterprise/entities/product-size';

export interface ProductSizeRepository {
  findByProductId(productId: string): Promise<ProductSize[]>;
  findBySizeId(
    sizeId: string,
    params: PaginationParams
  ): Promise<ProductSize[]>;
  create(productSize: ProductSize): Promise<void>;
  delete(productSize: ProductSize): Promise<void>;
  deleteAllByProductId(productId: string): Promise<void>;
}
