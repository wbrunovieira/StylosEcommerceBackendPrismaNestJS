import {
    Body,
    Controller,
    Post,
    HttpStatus,
    HttpException,
    ConflictException,
    UseGuards,
    Param,
    Get,
    Delete,
} from "@nestjs/common";

import { ZodValidationsPipe } from "@/pipes/zod-validations-pipe";
import { z } from "zod";
import { CreateCartUseCase } from "@/domain/order/application/use-cases/create-cart";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { AddItemToCartUseCase } from "@/domain/order/application/use-cases/add-item-cart";
import { CheckCartExistsUseCase } from "@/domain/order/application/use-cases/check-cart-exists";
import { DeleteItemFromCartUseCase } from "@/domain/order/application/use-cases/delete-item-cart";
import { GetCartByUserUseCase } from "@/domain/order/application/use-cases/get-Cart-ByUserId";

const createCartSchema = z.object({
    userId: z.string(),
    items: z.array(
        z.object({
            productId: z.string(),
            quantity: z.number().min(0),
            cartId: z.string().optional(),
            price: z.number().min(0),
            colorId: z.string().optional(),
            sizeId: z.string().optional(),
            productIdVariant: z.string().optional(),
            hasVariants: z.boolean(),
        })
    ),
});

const bodyValidationPipe = new ZodValidationsPipe(createCartSchema);
type CreateCartBodySchema = z.infer<typeof createCartSchema>;

const addItemSchema = z.object({
    productId: z.string(),
    cartId: z.string().optional(),
    quantity: z.number().min(0),
    weight: z.number().optional(),
    height: z.number().optional(),
    length: z.number().optional(),
    width: z.number().optional(),
    price: z.number().min(0),
    colorId: z.string().optional(),
    sizeId: z.string().optional(),
    hasVariants: z.boolean(),
});

const addItemValidationPipe = new ZodValidationsPipe(addItemSchema);

type AddItemBodySchema = z.infer<typeof addItemSchema>;

@UseGuards(JwtAuthGuard)
@Controller("cart")
export class CartController {
    constructor(
        private readonly createcartUseCase: CreateCartUseCase,
        private readonly addItemToCartUseCase: AddItemToCartUseCase,
        private readonly checkCartExistsUseCase: CheckCartExistsUseCase,
        private deleteItemFromCartUseCase: DeleteItemFromCartUseCase,
        private getCartByUserUseCase: GetCartByUserUseCase
    ) {}

    @Post()
    async createCart(@Body(bodyValidationPipe) body: CreateCartBodySchema) {
        try {
            const result = await this.createcartUseCase.execute(body);

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

    @Post("add-item/:userId")
    async addItemToCart(
        @Param("userId") userId: string,
        @Body(addItemValidationPipe) body: AddItemBodySchema
    ) {
        try {
            const item = {
                ...body,
                weight: body.weight ?? 0,
                height: body.height ?? 0,
                length: body.length ?? 0,
                width: body.width ?? 0,
            };

            const result = await this.addItemToCartUseCase.execute({
                userId,
                item,
            });

            if (result.isLeft()) {
                const error = result.value;
                if (error instanceof ResourceNotFoundError) {
                    throw new ConflictException(error.message);
                }
                throw new ConflictException("An unexpected error occurred");
            }
            return result.value;
        } catch (error) {
            console.error("Erro ao adicionar item ao cart:", error);
            if (error instanceof ConflictException) {
                throw error;
            }
            throw new HttpException(
                "Failed to add item to cart",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get(":userId/exists")
    async checkCartExists(@Param("userId") userId: string) {
        try {
            const result = await this.checkCartExistsUseCase.execute({
                userId,
            });
            if (result.isLeft()) {
                throw new HttpException(
                    result.value.message,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
            return { exists: result.value };
        } catch (error) {
            console.error("Erro ao verificar se o carrinho existe:", error);
            throw new HttpException(
                "Failed to check if cart exists",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get("user/:userId")
    async getCartByUser(@Param("userId") userId: string) {
        try {
            const result = await this.getCartByUserUseCase.execute({ userId });

            if (result.isLeft()) {
                const error = result.value;
                throw new HttpException(error.message, HttpStatus.NOT_FOUND);
            }

            return result.value;
        } catch (error) {
            throw new HttpException(
                "Failed to fetch cart",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Delete(":cartId/item/:itemId")
    async deleteItemFromCart(
        @Param("cartId") cartId: string,
        @Param("itemId") itemId: string
    ) {
        try {
            const result = await this.deleteItemFromCartUseCase.execute({
                cartId,
                itemId,
            });

            if (result.isLeft()) {
                const error = result.value;
                throw new HttpException(error.message, HttpStatus.NOT_FOUND);
            }

            return {
                message: "Item removed from cart successfully",
            };
        } catch (error) {
            throw new HttpException(
                "Failed to remove item from cart",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
