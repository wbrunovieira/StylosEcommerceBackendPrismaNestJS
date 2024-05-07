import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

interface ProductSizeProps {
  productId: UniqueEntityID;
  sizeId: UniqueEntityID;
}

export class ProductSize extends Entity<ProductSizeProps> {
  constructor(props: ProductSizeProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get productId(): UniqueEntityID {
    return this.props.productId;
  }

  get sizeId(): UniqueEntityID {
    return this.props.sizeId;
  }
}
