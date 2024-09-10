import { FindOrderByIdUseCase } from "@/domain/order/application/use-cases/find-order-by-id";
import { ListAllOrdersUseCase } from "@/domain/order/application/use-cases/get-all-orders";
import { ListOrdersByUserUseCase } from "@/domain/order/application/use-cases/list-order-by-user";
import {
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
} from "@nestjs/common";

@Controller("orders")
export class OrderController {
    constructor(
        private readonly listAllOrdersUseCase: ListAllOrdersUseCase,
        private readonly listOrdersByUserUseCase: ListOrdersByUserUseCase,
        private readonly findOrderByIdUseCase: FindOrderByIdUseCase
    ) {}

    @Get("all")
    async listAllOrders() {
        try {
            const result = await this.listAllOrdersUseCase.execute();

            if (result.isLeft()) {
                throw new HttpException(
                    result.value.message,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }

            return result.value;
        } catch (error) {
            console.error("Error listing all orders:", error);
            throw new HttpException(
                "Failed to list orders",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get("user/:userId")
    async listOrdersByUser(@Param("userId") userId: string) {
        try {
            const result = await this.listOrdersByUserUseCase.execute(userId);

            if (result.isLeft()) {
                throw new HttpException(
                    result.value.message,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }

            return result.value;
        } catch (error) {
            console.error("Error listing orders by user:", error);
            throw new HttpException(
                "Failed to list orders for user",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get("order/:orderId")
    async findOrderById(@Param("orderId") orderId: string) {
        try {
            const result = await this.findOrderByIdUseCase.execute(orderId);

            if (result.isLeft()) {
                throw new HttpException(
                    result.value.message,
                    HttpStatus.NOT_FOUND
                );
            }

            return result.value;
        } catch (error) {
            console.error("Error finding order by id:", error);
            throw new HttpException(
                "Failed to find order",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
