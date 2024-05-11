
export interface IProductCategoryRepository {
  create(productId: string, categoryId: string): Promise<void>;
 
}
