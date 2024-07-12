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

    getItems(): CartItem[] {
        return this.props.items;
    }

    addItem(newItem: CartItem) {
        console.log("entrou addItem cart entity foi chamado");
        console.log("addItem cart entity newItem", newItem);
        const existingItemIndex = this.items.findIndex(
            (item) =>
                item.productId === newItem.productId &&
                item.color === newItem.color &&
                item.size === newItem.size
        );

        console.log("addItem cart entity existingItemIndex", existingItemIndex);
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

    static fromPrisma(cartData: any): Cart {
        const items = cartData.items.map((item: any) =>
            CartItem.create(
                {
                    cartId: item.cartId,
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                    height: item.height,
                    width: item.width,
                    length: item.length,
                    weight: item.weight,
                    color: item.colorId,
                    size: item.sizeId,
                    hasVariants: item.hasVariants,
                    productIdVariant: item.productIdVariant,
                },
                new UniqueEntityID(item.id)
            )
        );
        console.log("cart entity items", items);

        const cartCreated = Cart.create(
            {
                userId: cartData.userId,
                items: items,
            },
            new UniqueEntityID(cartData.id)
        );

        console.log("cart entity cartCreated", cartCreated);
        return cartCreated;
    }
}
