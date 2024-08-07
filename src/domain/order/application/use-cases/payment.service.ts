import { Env } from "@/env";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MercadoPagoConfig, Preference } from "mercadopago";
import mercadopago from "mercadopago";

import * as crypto from "crypto";
import { PrismaCartRepository } from "@/infra/database/prisma/repositories/prisma-cart-repository";
import { PreferenceRequest } from "mercadopago/dist/clients/preference/commonTypes";
import { PrismaOrderRepository } from "@/infra/database/prisma/repositories/prisma-order-repository";
import { CreateOrderUseCase } from "./create-order";
import { OrderStatus } from "../../enterprise/entities/order-status";
import { FindCartByPreferenceIdUseCase } from "./find-cart-bt-preferenceId";

interface Item {
    id: string;
    title: string;
    description?: string;
    quantity: number;
    unit_price: number;
    currency_id?: string;
    picture_url?: string;
    category_id?: string;
}

@Injectable()
export class MercadoPagoService {
    private secretKey: string;

    private preference: Preference;
    constructor(
        private configService: ConfigService<Env, true>,

        private findCartByPreferenceId: FindCartByPreferenceIdUseCase,
        private orderUseCase: CreateOrderUseCase
    ) {
        const accessToken = configService.get<string>(
            "MERCADO_PAGO_ACCESS_TOKEN"
        );
        if (!accessToken) {
            throw new Error("MERCADO_PAGO_ACCESS_TOKEN is not defined");
        }

        const client = new MercadoPagoConfig({
            accessToken,
            options: { timeout: 5000 },
        });
        this.preference = new Preference(client);

        this.secretKey = configService.get<string>(
            "MERCADO_PAGO_ASSINATURA_SECRETA_WEBHOOK"
        );
    }

    async createPreference(cartId: string, items: Item[]) {
        try {
            const preferenceData: PreferenceRequest = {
                items: items.map((item) => ({
                    id: item.id,
                    title: item.title,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    currency_id: item.currency_id || "BRL",
                    picture_url: item.picture_url,
                    category_id: item.category_id,
                    description: item.description,
                })),
                payment_methods: {
                    excluded_payment_methods: [{ id: "pec" }],
                    excluded_payment_types: [{ id: "debit_card" }],
                    installments: 3,
                },
                back_urls: {
                    success:
                        "https://wbstylosfrontend.sa.ngrok.io/pagamento-sucesso",
                    failure:
                        "https://wbstylosfrontend.sa.ngrok.io/pagamento-falhou",
                    pending:
                        "https://wbstylosfrontend.sa.ngrok.io/pagamento-pendente",
                },
                auto_return: "approved",
                external_reference: cartId,
                notification_url:
                    "https://wbstylosbackend.sa.ngrok.io/shipping/webhookpro",
            };

            const response = await this.preference.create({
                body: preferenceData,
            });

            console.log("Payment preference created successfully", response);

            const preferenceId = response.id;
            console.log("Payment preference preferenceId", preferenceId);

            const savedPreferenceId =
                await this.findCartByPreferenceId.savePreferenceId(
                    cartId,
                    preferenceId
                );
            console.log("PsavedPreferenceId", savedPreferenceId);
            console.log("response", response);

            return response;
        } catch (error) {
            console.error("Error creating preference:", error);
            throw new Error("Error creating preference");
        }
    }

    async validateSignature(
        payload: any,
        xSignature: string,
        xRequestId: string
    ): Promise<boolean> {
        if (!this.secretKey) {
            throw new Error(
                "MERCADO_PAGO_SECRET_KEY is not set in environment variables"
            );
        }

        console.log("validateSignature entrou");

        const [tsPart, v1Part] = xSignature.split(",");

        if (!tsPart || !v1Part) {
            throw new HttpException(
                "Invalid signature format",
                HttpStatus.UNAUTHORIZED
            );
        }

        const ts = tsPart.split("=")[1];
        const v1 = v1Part.split("=")[1];

        const signatureTemplate = `id:${payload.data.id};request-id:${xRequestId};ts:${ts};`;

        const hash = crypto
            .createHmac("sha256", this.secretKey)
            .update(signatureTemplate)
            .digest("hex");

        console.log("Signature Template:", signatureTemplate);
        console.log("Calculated Hash:", hash);
        console.log("Provided Hash:", v1);
        console.log("this.secretKey", this.secretKey);

        console.log("Calculated Hash:", hash);

        if (hash !== v1) {
            throw new HttpException(
                "Invalid signature",
                HttpStatus.UNAUTHORIZED
            );
        }

        return true;
    }

    async processWebhookNotification(body: any, dataId: string, type: string) {
        console.log(
            "Processing webhook notification with dataId:",
            dataId,
            "and type:",
            type
        );

        const action = type || body.action;

        const data = body.data || { id: dataId };

        if (!action || !data.id) {
            console.error("Invalid webhook data:", body);
            throw new Error("Invalid webhook data");
        }

        const paymentId = data.id;
        const dateCreated = body.date_created;
        const liveMode = body.live_mode;
        const apiVersion = body.api_version;
        const userId = body.user_id;

        let cart = await this.findCartByPreferenceId.execute(paymentId);

        if (!cart) {
            console.error(`Cart not found for payment ID: ${paymentId}`);
            throw new Error("Cart not found for the given payment ID");
        }

        if (action === "payment.created") {
            const paymentId = data.id;
            console.log(
                `Processing payment created event for payment ID: ${paymentId}`
            );
        }

        if (action === "payment.approved") {
            console.log(
                `
                
                Processing payment created event for payment ID: ${paymentId}`
            );
            const createOrderRequest = {
                userId: cart.userId,
                items: cart.items.map((item) => ({
                    productId: item.productId,
                    productName: item.productName,
                    imageUrl: item.imageUrl,
                    quantity: item.quantity,
                    price: item.price,
                })),

                status: OrderStatus.COMPLETED,
                paymentId: paymentId,
                paymentStatus: "APPROVED",
                paymentMethod: body.payment_method_id,
                paymentDate: new Date(dateCreated),
            };

            const order = await this.orderUseCase.execute(createOrderRequest);
        } else if (action === "payment.updated") {
            const paymentId = data.id;
            console.log(
                `Processing payment updated event for payment ID: ${paymentId}`
            );
        }
    }
}
