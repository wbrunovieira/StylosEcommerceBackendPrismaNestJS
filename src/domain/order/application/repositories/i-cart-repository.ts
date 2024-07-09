
import { Either } from "@/core/either";
import { Cart } from "../../enterprise/entities/cart";

export abstract class ICartRepository {
  abstract create(cart: Cart): Promise<Either<Error, void>>;
  abstract findCartByUser(userId: string): Promise<Either<Error, Cart>>;
  abstract save(cart: Cart): Promise<Either<Error, void>>;
  abstract cartExists(userId: string): Promise<Either<Error, boolean>>;
  abstract removeItemFromCart(cartId: string, itemId: string): Promise<Either<Error, void>>;
  abstract findById(cartId: string): Promise<Either<Error, Cart>>;
  
 }
