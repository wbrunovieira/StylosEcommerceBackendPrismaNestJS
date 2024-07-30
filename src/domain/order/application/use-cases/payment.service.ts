import { Injectable } from "@nestjs/common";
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
    constructor() {
        this.client = new MercadoPagoConfig({
            accessToken: "YOUR_ACCESS_TOKEN",
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
