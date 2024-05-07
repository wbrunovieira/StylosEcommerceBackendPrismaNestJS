import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

interface CartItemProps {
  productId: UniqueEntityID;
  quantity: number;
  price: number;
}

export class CartItem extends Entity<CartItemProps> {
  constructor(props: CartItemProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get productId(): UniqueEntityID {
    return this.props.productId;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  setQuantity(quantity: number): void {
    this.props.quantity = quantity;
  }
}
