// import {
//   Body,
//   Controller,
//   Delete,
//   HttpException,
//   HttpStatus,
//   Param,
//   Get,
//   Post,
//   UseGuards,
// } from '@nestjs/common';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// import { CurrentUser } from 'src/auth/current-user-decorator';
// import { UserPayload } from 'src/auth/jwt.strategy';

// import { ZodValidationsPipe } from '../pipes/zod-validations-pipe';
// import { PrismaService } from 'src/prisma/prisma.service';
// import { z } from 'zod';

// const createProductBodySchema = z.object({
//   name: z.string(),
//   description: z.string(),
//   color: z.string().optional(),
//   size: z.string().optional(),
//   images: z.array(z.string()).max(5).optional(),
//   material: z.string().optional(),
//   brand: z.string(),
//   price: z.number(),
//   stock: z.number(),
//   discount: z.number().optional(),
//   onSale: z.boolean().optional(),
//   isNew: z.boolean().optional(),
//   isFeatured: z.boolean().optional(),
//   FinalPrice: z.number().optional(),
// });

// const bodyValidationPipe = new ZodValidationsPipe(createProductBodySchema);

// type CreateProductBodySchema = z.infer<typeof createProductBodySchema>;

// @Controller('/products')
// export class CreateProductController {
//   constructor(private prisma: PrismaService) {}

//   @UseGuards(JwtAuthGuard)
//   @Post()
//   async handle(
//     @Body(bodyValidationPipe) body: CreateProductBodySchema,
//     @CurrentUser() user: UserPayload
//   ) {
//     console.log('body', body);
//     const {
//       name,
//       description,
//       color,
//       size,
//       material,
//       brand,
//       price,
//       stock,
//       images,
//       discount,
//       isNew,
//       isFeatured,
//       onSale,
//     } = body;
//     const userId = user.sub;

//     const priceAsFloat = parseFloat(price.toString());

//     const validDiscount = typeof discount === 'number' ? discount : 0;
//     const finalPrice = price * (1 - validDiscount / 100);

//     const product = await this.prisma.product.create({
//       data: {
//         name,
//         description,
//         images,
//         color,
//         size,
//         material,
//         brand,
//         price: priceAsFloat,
//         stock: Number(stock),
//         discount: discount ? parseFloat(discount.toString()) : undefined,
//         onSale,
//         isNew,
//         isFeatured: isFeatured ? true : false,
//         FinalPrice: finalPrice,
//       },
//     });
//     console.log('product', product);
//     return { product };
//   }

//   @UseGuards(JwtAuthGuard)
//   @Delete(':id')
//   async deleteProduct(@Param('id') id: string) {
//     try {
//       const product = await this.prisma.product.findUnique({ where: { id } });
//       if (!product) {
//         throw new HttpException('Produto não encontrado', HttpStatus.NOT_FOUND);
//       }

//       await this.prisma.product.delete({ where: { id } });
//       return { message: 'Produto deletado com sucesso.' };
//     } catch (error) {
//       if (error instanceof HttpException) {
//         throw error;
//       }
//       throw new HttpException(
//         'Erro ao deletar o produto',
//         HttpStatus.INTERNAL_SERVER_ERROR
//       );
//     }
//   }
// }
