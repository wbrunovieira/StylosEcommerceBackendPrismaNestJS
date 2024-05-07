import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

interface ProductColorProps {
  productId: UniqueEntityID;
  colorId: UniqueEntityID;
}

export class ProductColor extends Entity<ProductColorProps> {
  constructor(props: ProductColorProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get productId(): UniqueEntityID {
    return this.props.productId;
  }

  get colorId(): UniqueEntityID {
    return this.props.colorId;
  }
}
