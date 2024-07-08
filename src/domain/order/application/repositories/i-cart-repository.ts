
import { Either } from "@/core/either";
import { Cart } from "../../enterprise/entities/cart";

export abstract class ICartRepository {
  abstract create(cart: Cart): Promise<Either<Error, void>>;
  abstract findCartByUser(userId: string): Promise<Either<Error, Cart>>;
  abstract save(cart: Cart): Promise<Either<Error, void>>;
  abstract cartExists(userId: string): Promise<Either<Error, boolean>>;
 }
