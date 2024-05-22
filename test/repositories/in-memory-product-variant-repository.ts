import { Either, left, right } from "@/core/either";
import { IProductVariantRepository } from "@/domain/catalog/application/repositories/i-product-variant-repository";
import { ProductVariant } from "@/domain/catalog/enterprise/entities/product-variant";



export class InMemoryProductVariantRepository
  implements IProductVariantRepository
{
  public items: ProductVariant[] = [];

  async create(productVariant: ProductVariant):Promise<Either<Error, void>> {
    try {
        this.items.push(productVariant);
        return right(undefined);
      } catch (error) {
        return left(new Error('Failed to create product variant'));
      }
  }

  async findByProductId(productId: string): Promise<ProductVariant[]> {
    return this.items.filter((item) => item.productId.toString() === productId);
  }
}
