import { Env } from "@/env";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MercadoPagoConfig, Preference } from "mercadopago";

import * as crypto from "crypto";

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
    private client;
    private secretKey: string;
    constructor(private configService: ConfigService<Env, true>) {
        const accessToken = configService.get<string>(
            "MERCADO_PAGO_ACCESS_TOKEN"
        );
        this.secretKey = configService.get<string>(
            "MERCADO_PAGO_ASSINATURA_SECRETA_WEBHOOK"
        );

        this.client = new MercadoPagoConfig({ accessToken });
    }

    async createPreference(items: Item[]) {
        try {
            const preference = new Preference(this.client);

            console.log("payment preference", preference);

            const response = await preference.create({
                body: {
                    payment_methods: {
                        excluded_payment_methods: [
                            {
                                id: "pec",
                            },
                        ],
                        excluded_payment_types: [
                            {
                                id: "debit_card",
                            },
                        ],
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
                    items: items,
                },
            });

            console.log("payment preference create", preference);

            return response;
        } catch (error) {
            console.log(error);
            throw new Error("Error creating preference");
        }
    }

    validateSignature(
        payload: any,
        xSignature: string,
        xRequestId: string
    ): boolean {
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

        if (action === "payment.created") {
            const paymentId = data.id;
            console.log(
                `Processing payment created event for payment ID: ${paymentId}`
            );
        } else if (action === "payment.updated") {
            const paymentId = data.id;
            console.log(
                `Processing payment updated event for payment ID: ${paymentId}`
            );
            // Additional logic for payment updates
        }
        // Add more logic as necessary
    }
}
