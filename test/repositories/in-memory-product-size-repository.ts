import { ProductSize } from '@/domain/catalog/enterprise/entities/product-size';


import { ProductSizeRepository } from '@/domain/catalog/application/repositories/product-size-repository';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';

export class InMemoryProductSizeRepository implements ProductSizeRepository {
    
  public items: ProductSize[] = [];

  async create(productId: string, sizeId: string): Promise<void> {
  
    const productIdUnique = new UniqueEntityID(productId);
    const colorIdUnique = new UniqueEntityID(sizeId);

   
    const productColor = new ProductSize({
      productId: productIdUnique,
      sizeId: colorIdUnique
    });

    this.items.push(productColor);
  }
  // findByProductId(productId: string): Promise<ProductSize[]> {
  //   throw new Error('Method not implemented.');
  // }
  // findBySizeId(
  //   sizeId: string,
  //   params: PaginationParams
  // ): Promise<ProductSize[]> {
  //   throw new Error('Method not implemented.');
  // }
 
  // delete(productSize: ProductSize): Promise<void> {
  //   throw new Error('Method not implemented.');
  // }
  // deleteAllByProductId(productId: string): Promise<void> {
  //   throw new Error('Method not implemented.');
  // }
  // findById(id: string): Promise<Size> {
  //   throw new Error('Method not implemented.');
  // }
}
