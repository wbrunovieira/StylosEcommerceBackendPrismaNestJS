import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { SaveShippingUseCase } from "@/domain/order/application/use-cases/create-shipping";
import { FindCartByPreferenceIdUseCase } from "@/domain/order/application/use-cases/find-cart-bt-preferenceId";
import { MercadoPagoService } from "@/domain/order/application/use-cases/payment.service";
import { ZodValidationsPipe } from "@/pipes/zod-validations-pipe";

import {
    Body,
    Controller,
    Post,
    HttpException,
    HttpStatus,
    Headers,
    ConflictException,
    Query,
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

const paymentSuccess = z.object({
    collection_id: z.string(),
    cartId: z.string(),
});

const paymentValidationBody = new ZodValidationsPipe(paymentSuccess);
type PaymentSuccessBodySchema = z.infer<typeof paymentSuccess>;

const mercadoPagoWebhookSchema = z.object({
    id: z.string(),
    live_mode: z.boolean(),
    type: z.string(),
    date_created: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format",
    }),
    application_id: z.string().nullable().optional(),
    user_id: z.union([z.string(), z.number()]),
    version: z.string().optional(),
    api_version: z.string(),
    action: z.string(),
    data: z.object({
        id: z.string(),
    }),
});

const mercadoPagoWebhookValidationPipe = new ZodValidationsPipe(
    mercadoPagoWebhookSchema
);
type MercadoPagoWebhookSchema = z.infer<typeof mercadoPagoWebhookSchema>;

@Controller("shipping")
export class ShippingController {
    constructor(
        private readonly saveShippingUseCase: SaveShippingUseCase,
        private mercadoPagoService: MercadoPagoService,
        private findCart: FindCartByPreferenceIdUseCase
    ) {}

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
    
    @Post("/payment-success")
    async saveIdPayment(
        @Body(bodyValidationPipe) body: PaymentSuccessBodySchema
    ) {
        try {
            console.log("epayment-success");
            console.log("entrou no createShipment body", body);
            const { cartId, collection_id } = body;
            const result = await this.findCart.saveCollectionId(
                cartId,
                collection_id
            );
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

    @Post("/webhookpro")
    async handleMercadoPagoWebhook(
        @Body(mercadoPagoWebhookValidationPipe) body: MercadoPagoWebhookSchema,
        @Headers("x-signature") xSignature: string,
        @Headers("x-request-id") xRequestId: string,
        @Query("data.id") dataId: string,
        @Query("type") type: string
    ) {
        try {
            console.log("Webhook recebido:", body);
            console.log("Query Parameters - data.id:", dataId, "type:", type);
            const {
                action,
                api_version,
                data,
                date_created,
                id,
                live_mode,
                type: bodyType,
                user_id,
            } = body;

            console.log("Action:", action);

            console.log("Payment Data ID:", data.id);

            console.log("Webhook ID:", id);
            console.log("Live Mode:", live_mode);
            console.log("Type:", bodyType);
            console.log("User ID:", user_id);

            await this.mercadoPagoService.validateSignature(
                body,
                xSignature,
                xRequestId
            );

            await this.mercadoPagoService.processWebhookNotification(
                body,
                dataId,
                type
            );

            return {
                statusCode: HttpStatus.CREATED,
                message: "Webhook processed successfully",
            };
        } catch (error: any) {
            if (error instanceof HttpException) {
                throw error;
            }
            console.error(
                "Erro ao processar o webhook do Mercado Pago:",
                error
            );
            throw new HttpException(
                {
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: "Failed to process webhook",
                    details: error.message || "Unknown error occurred",
                },

                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
