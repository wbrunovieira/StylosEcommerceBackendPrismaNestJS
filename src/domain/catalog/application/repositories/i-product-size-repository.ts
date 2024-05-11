export interface IProductSizeRepository {
  create(productId: string, sizeId: string): Promise<void>;
  // findByProductId(productId: string): Promise<ProductSize[]>;
  // findBySizeId(
  //   sizeId: string,
  //   params: PaginationParams
  // ): Promise<ProductSize[]>;
  // delete(productSize: ProductSize): Promise<void>;
  // deleteAllByProductId(productId: string): Promise<void>;
}
