import { ProductSize } from '@/domain/catalog/enterprise/entities/product-size';

import { PaginationParams } from '@/core/repositories/pagination-params';
import { ProductSizeRepository } from '@/domain/catalog/application/repositories/product-size-repository';
import { Size } from '@/domain/catalog/enterprise/entities/size';

export class InMemoryProductSizeRepository implements ProductSizeRepository {
  findByProductId(productId: string): Promise<ProductSize[]> {
    throw new Error('Method not implemented.');
  }
  findBySizeId(
    sizeId: string,
    params: PaginationParams
  ): Promise<ProductSize[]> {
    throw new Error('Method not implemented.');
  }
  create(productSize: ProductSize): Promise<void> {
    throw new Error('Method not implemented.');
  }
  delete(productSize: ProductSize): Promise<void> {
    throw new Error('Method not implemented.');
  }
  deleteAllByProductId(productId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  findById(id: string): Promise<Size> {
    throw new Error('Method not implemented.');
  }
}
