import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { CartItem } from "./cart-item";

interface CartProps {
    userId: string;
    items: CartItem[];
}

export class Cart extends Entity<CartProps> {
    private constructor(props: CartProps, id?: UniqueEntityID) {
        super(props, id);
    }

    static create(props: CartProps, id?: UniqueEntityID): Cart {
        return new Cart(props, id);
    }

    get userId(): string {
        return this.props.userId;
    }

    get items(): CartItem[] {
        return this.props.items;
    }
    addItem(newItem: CartItem) {
        const existingItemIndex = this.items.findIndex(
            (item) =>
                item.productId === newItem.productId &&
                item.color === newItem.color &&
                item.size === newItem.size
        );

        if (existingItemIndex !== -1) {
           
            this.items[existingItemIndex].quantity += newItem.quantity;
        } else {
         
            this.items.push(newItem);
        }
    }

    toObject() {
        return {
            id: this.id,
            userId: this.props.userId,
            items: this.props.items.map((item) => item.toObject()),
        };
    }
}
