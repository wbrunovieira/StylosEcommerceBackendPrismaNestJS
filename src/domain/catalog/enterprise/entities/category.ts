import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export interface CategoryProps {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Category extends Entity<CategoryProps> {
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
    props: Optional<CategoryProps, "createdAt" | "updatedAt">,
    id?: UniqueEntityID
  ) {
    const category = new Category(
      {
        ...props,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      id
    );

    return category;
  }
}