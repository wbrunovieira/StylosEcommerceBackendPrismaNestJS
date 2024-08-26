import { ListAllOrdersUseCase } from "@/domain/order/application/use-cases/get-all-orders";
import { Controller, Get, HttpException, HttpStatus } from "@nestjs/common";

@Controller("orders")
export class OrderController {
    constructor(private readonly listAllOrdersUseCase: ListAllOrdersUseCase) {}

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
}
