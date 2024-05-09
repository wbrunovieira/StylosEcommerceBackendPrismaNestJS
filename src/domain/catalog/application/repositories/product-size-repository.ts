import { PaginationParams } from '@/core/repositories/pagination-params';
import { ProductSize } from '../../enterprise/entities/product-size';

export interface ProductSizeRepository {
  create(productId: string, sizeId: string): Promise<void>;
  // findByProductId(productId: string): Promise<ProductSize[]>;
  // findBySizeId(
  //   sizeId: string,
  //   params: PaginationParams
  // ): Promise<ProductSize[]>;
  // delete(productSize: ProductSize): Promise<void>;
  // deleteAllByProductId(productId: string): Promise<void>;
}
