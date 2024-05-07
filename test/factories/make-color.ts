import { faker } from '@faker-js/faker';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Color, ColorProps } from '@/domain/catalog/enterprise/entities/color';

export function makeColor(
  override: Partial<ColorProps> = {},
  id?: UniqueEntityID
) {
  const color = Color.create(
    {
      name: faker.commerce.productName(),

      ...override,
    },
    id
  );

  return color;
}
