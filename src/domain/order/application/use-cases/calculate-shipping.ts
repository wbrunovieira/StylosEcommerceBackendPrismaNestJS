

// @Injectable()
// export class ShippingService {
//   constructor(private httpService: HttpService, private prisma: PrismaService) {}

//   async calculateShipping(data: any): Promise<any> {
//     const response = await this.httpService.post(
//       'https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate',
//       data,
//       {
//         headers: {
//           Authorization: `Bearer YOUR_API_KEY`,
//           'Content-Type': 'application/json',
//         },
//       },
//     ).toPromise();
//     return response.data;
//   }
// }
