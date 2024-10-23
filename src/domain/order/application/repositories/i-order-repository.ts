import { Either } from "@/core/either";
import { Order } from "../../enterprise/entities/order";

export abstract class IOrderRepository {
    abstract create(cart: Order): Promise<Either<Error, void>>;
    abstract listAllOrders(): Promise<Either<Error, Order[]>>
    abstract listOrdersByUserId(userId: string): Promise<Either<Error, Order[]>> 
    abstract findOrderById(orderId: string): Promise<Either<Error, Order>>
    abstract findOrdersByProduct(productId: string): Promise<Either<Error, Order[]>> 
    abstract findOrdersByCategory(categoryId: string): Promise<Either<Error, Order[]>> 
    abstract findOrdersByBrand(brandId: string): Promise<Either<Error, Order[]>> 
    abstract findTopSellingBrandsByTotalValue(): Promise<Either<Error, any>> 
    abstract findTopSellingCategoriesByTotalValue(): Promise<Either<Error, any>>
}
