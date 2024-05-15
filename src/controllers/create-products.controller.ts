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
// } from "@nestjs/common";
// import { JwtAuthGuard } from "../auth/jwt-auth.guard";
// import { CurrentUser } from "src/auth/current-user-decorator";
// import { UserPayload } from "src/auth/jwt.strategy";

// import { ZodValidationsPipe } from "../pipes/zod-validations-pipe";
// import { PrismaService } from "src/prisma/prisma.service";
// import { z } from "zod";
// import { CreateProductUseCase } from "@/domain/catalog/application/use-cases/create-product";

// const createProductBodySchema = z.object({
//   name: z.string(),
//   description: z.string(),
//   productColors: z.array(z.string()).optional(),
//   productSizes: z.array(z.string()).optional(),
//   productCategories: z.array(z.string()),
//   materialId: z.string(),
//   brandId: z.string(),
//   price: z.number(),
//   stock: z.number(),
//   discount: z.number().optional(),
//   onSale: z.boolean().optional(),
//   isNew: z.boolean().optional(),
//   isFeatured: z.boolean().optional(),
//   images: z.array(z.string()).max(5).optional(),
//   height: z.number().optional(),
//   width: z.number().optional(),
//   length: z.number().optional(),
//   weight: z.number().optional(),
// });

// const bodyValidationPipe = new ZodValidationsPipe(createProductBodySchema);

// type CreateProductBodySchema = z.infer<typeof createProductBodySchema>;

// @Controller("/products")
// export class CreateProductController {
//   constructor(
//     private prisma: PrismaService,
//     private createProductUseCase: CreateProductUseCase
//   ) {}

//   @UseGuards(JwtAuthGuard)
//   @Post()
//   async createProduct(
//     @Body(bodyValidationPipe) body: CreateProductBodySchema,
//     @CurrentUser() user: UserPayload
//   ) {
//     try {
//       console.log("body brunao", body);
//       const result = await this.createProductUseCase.execute({
//         name: body.name,
//         description: body.description,
//         materialId: body.materialId,
//         brandId: body.brandId,
//         price: body.price,
//         stock: body.stock,
//         discount: body.discount,
//         onSale: body.onSale,
//         isNew: body.isNew,
//         isFeatured: body.isFeatured,
//         images: body.images,
//         height: body.height,
//         width: body.width,
//         length: body.length,
//         weight: body.weight,
//       });
//       console.log("result brunao", result.value);

//       return result.value;
//     } catch (error) {
//       throw new HttpException(
//         "Failed to create product",
//         HttpStatus.INTERNAL_SERVER_ERROR
//       );
//     }
//   }

//   @UseGuards(JwtAuthGuard)
//   @Delete(":id")
//   async deleteProduct(@Param("id") id: string) {
//     try {
//       const product = await this.prisma.product.findUnique({ where: { id } });
//       if (!product) {
//         throw new HttpException("Produto não encontrado", HttpStatus.NOT_FOUND);
//       }

//       await this.prisma.product.delete({ where: { id } });
//       return { message: "Produto deletado com sucesso." };
//     } catch (error) {
//       if (error instanceof HttpException) {
//         throw error;
//       }
//       throw new HttpException(
//         "Erro ao deletar o produto",
//         HttpStatus.INTERNAL_SERVER_ERROR
//       );
//     }
//   }
// }
