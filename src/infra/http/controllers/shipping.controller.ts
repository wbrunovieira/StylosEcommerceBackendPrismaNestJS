import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { SaveShippingUseCase } from "@/domain/order/application/use-cases/create-shipping";
import { ZodValidationsPipe } from "@/pipes/zod-validations-pipe";

import {
    Body,
    Controller,
    Post,
    HttpException,
    HttpStatus,
    ConflictException,
} from "@nestjs/common";
import { z } from "zod";

const createShipmentSchema = z.object({
    userId: z.string(),
    orderId: z.string().optional(),
    name: z.string(),
    service: z.string().optional(),
    trackingCode: z.string().optional(),
    shippingCost: z.number().min(0),
    deliveryTime: z.number().min(0),
});

const bodyValidationPipe = new ZodValidationsPipe(createShipmentSchema);
type CreateShipmentBodySchema = z.infer<typeof createShipmentSchema>;

@Controller("shipping")
export class ShippingController {
    constructor(private readonly saveShippingUseCase: SaveShippingUseCase) {}

    @Post("/create")
    async createShipment(
        @Body(bodyValidationPipe) body: CreateShipmentBodySchema
    ) {
        try {
            console.log("entrou no createShipment");
            console.log("entrou no createShipment body", body);
            const result = await this.saveShippingUseCase.execute(body);
            console.log("entrou no createShipment body", result);

            if (result.isLeft()) {
                const error = result.value;
                if (error instanceof ResourceNotFoundError) {
                    throw new ConflictException(error.message);
                }
                throw new ConflictException("An unexpected error occurred");
            }
            return result.value;
        } catch (error) {
            console.error("Erro ao criar shipment:", error);
            if (error instanceof ConflictException) {
                throw error;
            }
            throw new HttpException(
                "Failed to create shipment",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
