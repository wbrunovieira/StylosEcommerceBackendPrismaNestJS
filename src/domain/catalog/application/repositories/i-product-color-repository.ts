export interface IProductColorRepository {
  create(productId: string, colorId: string): Promise<void>;
}
