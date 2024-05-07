import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { CartItem } from './cart-item';

interface CartProps {
  items: CartItem[];
}

export class Cart extends Entity<CartProps> {
  private constructor(props: CartProps, id?: UniqueEntityID) {
    super(props, id);
  }

  static create(props: CartProps, id?: UniqueEntityID): Cart {
    return new Cart(props, id);
  }

  get items(): CartItem[] {
    return this.props.items;
  }

  addItem(item: CartItem): void {
    this.props.items.push(item);
  }
}
