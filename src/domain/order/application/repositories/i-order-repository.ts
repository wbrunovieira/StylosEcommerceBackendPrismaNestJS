import { Either } from "@/core/either";
import { Order } from "../../enterprise/entities/order";

export abstract class IOrderRepository {
    abstract create(cart: Order): Promise<Either<Error, void>>;
}
