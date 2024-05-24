
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Either, left, right } from "@/core/either";
import { IProductColorRepository } from "@/domain/catalog/application/repositories/i-product-color-repository";
import { ProductColor } from "@/domain/catalog/enterprise/entities/product-color";


export class InMemoryProductColorRepository implements IProductColorRepository {

  public items: ProductColor[] = [];

  async create(
    productId: string,
    colorId: string
  ): Promise<Either<Error, void>> {
  

    const productIdUnique = new UniqueEntityID(productId.toString());
    const colorIdUnique = new UniqueEntityID(colorId.toString());

    const now = new Date();

    const productColor = new ProductColor({
      productId: productIdUnique ,
      colorId: colorIdUnique,
      createdAt: now,
      updatedAt: now,
    });

    this.items.push(productColor);
    return right(undefined);
  }

  async findByProductId(productId: string): Promise<ProductColor[]> {
    return this.items.filter((item) => item.productId.toString() === productId);
  }

  async findByColorId(colorId: string): Promise<ProductColor[]> {
    return this.items.filter((item) => item.colorId.toString() === colorId);
  }

  async addItem(productColor: ProductColor): Promise<void> {
    this.items.push(productColor);
  }

  async delete(productColor: ProductColor): Promise<void> {
    this.items = this.items.filter(
      (item) =>
        item.productId.toString() !== productColor.productId.toString() ||
        item.colorId.toString() !== productColor.colorId.toString()
    );
  }
  async deleteAllByProductId(productId: string): Promise<void> {
    this.items = this.items.filter(
      (item) => item.productId.toString() !== productId
    );
  }
}
