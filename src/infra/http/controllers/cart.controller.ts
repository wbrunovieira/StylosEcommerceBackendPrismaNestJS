import {
  Body,
  Controller,
  Post,
  HttpStatus,
  HttpException,
  ConflictException,
  UseGuards,
} from "@nestjs/common";

import { ZodValidationsPipe } from "@/pipes/zod-validations-pipe";
import { z } from "zod";
import { CreateCartUseCase } from "@/domain/order/application/use-cases/create-cart";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";

const createCartSchema = z.object({
  userId: z.string(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(0),
      variantId: z.string().optional(),  
      price: z.number().min(0),
      colorId: z.string().optional(), 
      sizeId: z.string().optional(),  
    })
  ),
});

const bodyValidationPipe = new ZodValidationsPipe(createCartSchema);
type CreateCartBodySchema = z.infer<typeof createCartSchema>;

@UseGuards(JwtAuthGuard)
@Controller("cart")
export class CartController {
  constructor(private readonly createcartUseCase: CreateCartUseCase) {}

  @Post()
  async createCart(@Body(bodyValidationPipe) body: CreateCartBodySchema) {
    console.log("Received request body:", body);
    try {
      const result = await this.createcartUseCase.execute(body);
      console.log("CreateCartUseCase result:", result);

      if (result.isLeft()) {
        const error = result.value;
        if (error instanceof ResourceNotFoundError) {
          throw new ConflictException(error.message);
        }
        throw new ConflictException("An unexpected error occurred");
      }
      return result.value;
    } catch (error) {
      console.error("Erro ao criar cart:", error);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new HttpException(
        "Failed to create order",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
