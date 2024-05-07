import { faker } from '@faker-js/faker';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import {
  Product,
  ProductProps,
} from '@/domain/catalog/enterprise/entities/product';

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
      brandID: new UniqueEntityID(),

      materialId: new UniqueEntityID(),
      stock: faker.helpers.rangeToNumber(100),

      ...override,
    },
    id
  );

  return product;
}
