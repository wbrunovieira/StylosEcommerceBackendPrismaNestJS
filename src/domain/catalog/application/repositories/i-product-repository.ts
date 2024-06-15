import { Either } from "@/core/either";
import { Product } from "../../enterprise/entities/product";

export abstract class IProductRepository {
  abstract create(product: Product): Promise<Either<Error, void>>;

  abstract delete(product: Product): Promise<void>;
  abstract findByName(name: string): Promise<Either<Error, Product[]>>
  abstract findById(productId: string): Promise<Either<Error, Product>>;
  abstract findByCategoryId(categoryId: string): Promise<Either<Error, Product[]>>
  abstract findByBrandId(brandId: string): Promise<Either<Error, Product[]>>
  abstract findBySlug(slug: string): Promise<
    Either<
      Error,
      {
        product: Product;
        materialName?: string;
        brandName?: string;
        colors: { id: string; name: string; hex: string }[];
        sizes: { id: string; name: string }[];
        categories: { id:string, name: string; }[];
        variants: {
          id: string;
          sizeId?: string;
          colorId?: string;
          stock: number;
          price: number;
          images: string[];
          sku: string;
        }[];
      }
    >
  >;
  abstract save(product: Product): Promise<Either<Error, void>>;
}
