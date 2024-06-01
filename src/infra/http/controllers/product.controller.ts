import {
  Body,
  Controller,
  Delete,
  HttpException,
  HttpStatus,
  Param,
  Get,
  Post,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../../auth/jwt-auth.guard";


import { ZodValidationsPipe } from "../../../pipes/zod-validations-pipe";

import { z } from "zod";
import { CreateProductUseCase } from "@/domain/catalog/application/use-cases/create-product";
import { RolesGuard } from "@/auth/roles.guard";
import { Roles } from "@/auth/roles.decorator";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";

const createProductBodySchema = z.object({
  name: z.string(),
  description: z.string(),
  productColors: z.array(z.string()).optional(),
  productSizes: z.array(z.string()).optional(),
  productCategories: z.array(z.string()),
  materialId: z.string(),
  brandId: z.string(),
  sku: z.string().optional(),
  price: z.number(),
  stock: z.number(),
  discount: z.number().optional(),
  onSale: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  images: z.array(z.string()).max(5).optional(),
  height: z.number().optional(),
  width: z.number().optional(),
  length: z.number().optional(),
  weight: z.number().optional(),
});

const bodyValidationPipe = new ZodValidationsPipe(createProductBodySchema);

type CreateProductBodySchema = z.infer<typeof createProductBodySchema>;

@Controller("/products")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
export class ProductController {
  constructor(private createProductUseCase: CreateProductUseCase) {}

  @Post()
  async createProduct(@Body(bodyValidationPipe) body: CreateProductBodySchema) {
    try {
      const result = await this.createProductUseCase.execute({
        name: body.name,
        description: body.description,
        productColors: body.productColors,
        productSizes: body.productSizes,
        productCategories: body.productCategories,
        materialId: body.materialId || null,
        brandId: body.brandId,
        price: body.price,
        stock: body.stock,
        sku: body.sku || 'sku text',
        discount: body.discount || 0,
        onSale: body.onSale || false,
        isNew: body.isNew || false,
        isFeatured: body.isFeatured || false,
        images: body.images || [],
        height: body.height || null,
        width: body.width || null,
        length: body.length || null,
        weight: body.weight || null,
      });
     
      
      if (result.isLeft()) {
        const error = result.value;
        if (error instanceof ResourceNotFoundError) {
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
      } else {
        return { product: result.value.product };
      }
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        console.error("Error creating product:", error);
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(
        "Failed to create product",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
