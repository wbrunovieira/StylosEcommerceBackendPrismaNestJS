import { faker } from "@faker-js/faker";

import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import {
  Product,
  ProductProps,
} from "@/domain/catalog/enterprise/entities/product";

export function makeProduct(
  override: Partial<ProductProps> = {},
  id?: UniqueEntityID
) {
  const product = Product.create(
    {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: Number(faker.commerce.price()),
      sizeId: [new UniqueEntityID()],
      brandId: new UniqueEntityID(),

      materialId: new UniqueEntityID(),
      stock: faker.helpers.rangeToNumber(100),
      sku: faker.random.alphaNumeric(10),
      height: faker.datatype.number({ min: 1, max: 100 }),
      width: faker.datatype.number({ min: 1, max: 100 }),
      length: faker.datatype.number({ min: 1, max: 100 }),
      weight: faker.datatype.number({ min: 1, max: 100 }),
      onSale: faker.datatype.boolean(),
      isFeatured: faker.datatype.boolean(),
      isNew: faker.datatype.boolean(),
      images: [faker.image.dataUri()],
      createdAt: new Date(),
      updatedAt: new Date(),

      ...override,
    },
    id
  );

  return product;
}
