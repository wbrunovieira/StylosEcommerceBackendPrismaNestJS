import { Env } from "@/env";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

interface Item {
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
}

@Injectable()
export class MercadoPagoService {
    private client;
    private readonly mercado_pago_accesstoken;
    constructor(private configService: ConfigService<Env, true>) {
        this.configService = configService;
        this.mercado_pago_accesstoken = configService.get(
            "MERCADO_PAGO_ACCESS_TOKEN"
        );

        this.client = new MercadoPagoConfig({
            accessToken: this.mercado_pago_accesstoken,
        });
    }

    async createPreference(items: Item[]) {
        try {
            const payment = new Payment(this.client);
            const preference = new Preference(this.client);

            preference
                .create({
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
                        items: items,
                    },
                })
                .then(console.log)
                .catch(console.log);
            const response = await this.client.preferences.create(preference);
            return response.body;
        } catch (error) {
            console.log(error);
            throw new Error("Error creating preference");
        }
    }
}
