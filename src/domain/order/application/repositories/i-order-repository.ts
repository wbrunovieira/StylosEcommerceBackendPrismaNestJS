import { Either } from "@/core/either";
import { Order } from "../../enterprise/entities/order";

export abstract class IOrderRepository {
    abstract create(cart: Order): Promise<Either<Error, void>>;
    abstract listAllOrders(): Promise<Either<Error, Order[]>>
    abstract listOrdersByUserId(userId: string): Promise<Either<Error, Order[]>> 
    abstract findOrderById(orderId: string): Promise<Either<Error, Order>>
}
