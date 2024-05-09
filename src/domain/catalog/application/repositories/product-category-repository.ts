
export interface ProductCategoryRepository {
  create(productId: string, categoryId: string): Promise<void>;
 
}
