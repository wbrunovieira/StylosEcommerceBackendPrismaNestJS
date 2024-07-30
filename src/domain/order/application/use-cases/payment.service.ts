import { Env } from "@/env";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MercadoPagoConfig, Preference, } from "mercadopago";

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
    
    constructor(private configService: ConfigService<Env, true>) {
        const accessToken = configService.get<string>("MERCADO_PAGO_ACCESS_TOKEN");
        this.client = new MercadoPagoConfig({ accessToken });
    }

    async createPreference(items: Item[]) {
        try {

            
            const preference = new Preference(this.client);
            console.log("payment preference", preference);

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
            console.log("payment preference create", preference);
            const response = await this.client.preferences.create(preference);
            return response.body;
        } catch (error) {
            console.log(error);
            throw new Error("Error creating preference");
        }
    }
}
