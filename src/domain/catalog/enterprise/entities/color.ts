import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Optional } from '@/core/types/optional';

export interface ColorProps {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Color extends Entity<ColorProps> {
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
    props: Optional<ColorProps, 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID
  ) {
    const color = new Color(
      {
        ...props,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      id
    );

    return color;
  }
}
