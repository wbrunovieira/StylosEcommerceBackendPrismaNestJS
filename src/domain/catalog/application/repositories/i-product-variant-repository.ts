import { Either } from "../../../../core/either";
import { ProductVariant } from "../../enterprise/entities/product-variant";

export abstract class IProductVariantRepository {
  abstract create(productVariant: ProductVariant): Promise<Either<Error, void>>;
  abstract findByProductId(productId: string): Promise<ProductVariant[]>;
  abstract findByProductIds(productIds: string[]): Promise<ProductVariant[]>;

}
