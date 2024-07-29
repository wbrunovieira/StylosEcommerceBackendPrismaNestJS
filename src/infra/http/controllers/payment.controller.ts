import { PaymentService } from "@/domain/order/application/use-cases/payment.service";
import { Controller, Post, Get } from "@nestjs/common";

@Controller("payment")
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {}

    @Post("create-preference")
    async createPreference() {
        return await this.paymentService.createPreference();
    }
}
