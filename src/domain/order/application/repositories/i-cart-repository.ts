import { Either } from "@/core/either";
import { Cart } from "../../enterprise/entities/cart";
import { CartItem } from "../../enterprise/entities/cart-item";

export abstract class ICartRepository {
    abstract create(cart: Cart): Promise<Either<Error, void>>;
    abstract findCartByUser(userId: string): Promise<Either<Error, Cart>>;
    abstract save(cart: Cart): Promise<Either<Error, Cart>>;
    abstract cartExists(userId: string): Promise<Either<Error, boolean>>;
    abstract removeItemFromCart(
        cartId: string,
        itemId: string
    ): Promise<Either<Error, void>>;
    abstract findById(cartId: string): Promise<Either<Error, Cart>>;
    abstract addItemToCart(
        cartId: string,
        item: CartItem
    ): Promise<Either<Error, CartItem>>;
    abstract savePreferenceId(
        cartId: string,
        preferenceId: string,
        paymentStatus: string
    ): Promise<Either<Error, void>>;
    abstract findByPreferenceId(preferenceId: string): Promise<Cart | null>;
}
