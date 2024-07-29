// import { Injectable } from "@nestjs/common";
// import { ConfigService } from "@nestjs/config";
// import MercadoPago from "mercadopago";

// @Injectable()
// export class PaymentService {
//     private mercadopago: typeof MercadoPago;

//     constructor(private configService: ConfigService) {
//         this.mercadopago = new MercadoPago(
//             this.configService.get<string>("MERCADO_PAGO_ACCESS_TOKEN")
//         );
//     }

//     async createPreference() {
//         const preference = {
//             items: [
//                 {
//                     title: "My product",
//                     quantity: 1,
//                     unit_price: 2000,
//                 },
//             ],
//             payment_methods: {
//                 excluded_payment_methods: [{ id: "pec" }],
//                 excluded_payment_types: [],
//                 installments: 3,
//             },
//         };

//         try {
//             const response =
//                 await this.mercadopago.preferences.create(preference);
//             return response.body;
//         } catch (error) {
//             throw new Error(`Error creating preference: ${error.message}`);
//         }
//     }
// }
