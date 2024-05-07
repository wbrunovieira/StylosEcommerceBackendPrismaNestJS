import { faker } from '@faker-js/faker';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import {
  Material,
  MaterialProps,
} from '@/domain/catalog/enterprise/entities/material';

export function makeMaterial(
  override: Partial<MaterialProps> = {},
  id?: UniqueEntityID
) {
  const material = Material.create(
    {
      name: faker.commerce.productName(),

      ...override,
    },
    id
  );

  return material;
}
