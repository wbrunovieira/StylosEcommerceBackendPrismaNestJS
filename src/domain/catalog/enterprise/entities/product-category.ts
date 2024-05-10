import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

interface ProductCategoryProps {
  productId: UniqueEntityID;
  categoryId: UniqueEntityID;
}

export class ProductCategory extends Entity<ProductCategoryProps> {
  constructor(props: ProductCategoryProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get productId(): UniqueEntityID {
    return this.props.productId;
  }

  get categoryId(): UniqueEntityID {
    return this.props.categoryId;
  }
}
