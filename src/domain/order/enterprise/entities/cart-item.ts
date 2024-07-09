import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

interface CartItemProps {
  productId: string;
  quantity: number;
  price: number;
  height: number;
  width: number;
  length: number;
  weight: number;
  color?: string;
  size?: string;
}

export class CartItem extends Entity<CartItemProps> {
  constructor(props: CartItemProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get productId(): string {
    return this.props.productId;
  }
  get color(): string | undefined {
    return this.props.color ;
  }
  get size(): string | undefined   {
    return this.props.size;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get price(): number {
    return this.props.price;
  }
  get height(): number {
    return this.props.height;
  }

  get width(): number {
    return this.props.width;
  }

  get length(): number {
    return this.props.length;
  }

  get weight(): number {
    return this.props.weight;
  }

  setQuantity(quantity: number): void {
    this.props.quantity = quantity;
  }

  toObject() {
    return {
      id: this.id?.toString(),
      productId: this.productId,
      quantity: this.quantity,
      price: this.price,
      height: this.height,
      width: this.width,
      length: this.length,
      weight: this.weight,
      colorId: this.color,
      sizeId: this.size,
    };
  }

  static create(props: CartItemProps, id?: UniqueEntityID): CartItem {
    return new CartItem(props, id);
  }




}
