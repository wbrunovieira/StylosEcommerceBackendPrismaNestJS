
import { Either } from "@/core/either";
import { Cart } from "../../enterprise/entities/cart";

export abstract class ICartRepository {
  abstract create(cart: Cart): Promise<Either<Error, void>>;
 }
