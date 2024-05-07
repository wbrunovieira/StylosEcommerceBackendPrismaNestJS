import { faker } from '@faker-js/faker';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Brand, BrandProps } from '@/domain/catalog/enterprise/entities/brand';

export function makeBrand(
  override: Partial<BrandProps> = {},
  id?: UniqueEntityID
) {
  const brand = Brand.create(
    {
      name: faker.commerce.productName(),

      ...override,
    },
    id
  );

  return brand;
}
