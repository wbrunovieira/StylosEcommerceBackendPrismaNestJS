import { ProductColor } from "@/domain/catalog/enterprise/entities/product-color";

import { IProductColorRepository } from "@/domain/catalog/application/repositories/i-product-color-repository";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { Injectable } from "@nestjs/common";

@Injectable()
export class InMemoryProductColorRepository implements IProductColorRepository {
  public items: ProductColor[] = [];

  colorsIds = ["colorid1", "colorId2"];
  productIds = ["productid1", "productid2"];

  async create(
    productId: string,
    colorId: string
  ): Promise<Either<Error, void>> {
    console.log("chamou in memory productcolor", colorId, productId);

    if (!this.productIds.includes(productId)) {
      return left(new ResourceNotFoundError(`Product not found: ${productId}`));
    }
    if (!this.colorsIds.includes(colorId)) {
      return left(new ResourceNotFoundError(`Color not found: ${colorId}`));
    }

    const productColor = new ProductColor({
      productId: new UniqueEntityID(productId),
      colorId: new UniqueEntityID(colorId),
    });

    this.items.push(productColor);
    console.log("Product-color creation successful");
    return right(undefined);
  }
}
