import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Optional } from '@/core/types/optional';

export interface BrandProps {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Brand extends Entity<BrandProps> {
  get name(): string {
    return this.props.name;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  set name(name: string) {
    this.props.name = name;
  }

  static create(
    props: Optional<BrandProps, 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID
  ) {
    const brand = new Brand(
      {
        ...props,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      id
    );

    return brand;
  }
}
