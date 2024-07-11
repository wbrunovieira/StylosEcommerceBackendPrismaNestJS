import { Either, left, right } from "@/core/either";
import { PrismaService } from "../../../../prisma/prisma.service";
import { Injectable } from "@nestjs/common";

import { Cart } from "../../../../domain/order/enterprise/entities/cart";
import { ICartRepository } from "@/domain/order/application/repositories/i-cart-repository";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { CartItem } from "@/domain/order/enterprise/entities/cart-item";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";

@Injectable()
export class PrismaCartRepository implements ICartRepository {
    constructor(private prisma: PrismaService) {}

    async create(cart: Cart): Promise<Either<Error, void>> {
        try {
            const cartData = cart.toObject();

            const createdCart = await this.prisma.cart.create({
                data: {
                    id: cartData.id.toString(),
                    userId: cartData.userId,
                    items: {
                        create: cartData.items.map((item) => ({
                            productId: item.productId.toString(),
                            quantity: item.quantity,
                            price: item.price,
                            height: item.height,
                            productIdVariant: item.productIdVariant,
                            width: item.width,
                            length: item.length,
                            weight: item.weight,
                            colorId: item.colorId?.toString(),
                            sizeId: item.sizeId?.toString(),
                        })),
                    },
                },
            });
            console.log("createdCart in PrismaCartRepository", createdCart);

            return right(undefined);
        } catch (error) {
            return left(new Error("Failed to create cart"));
        }
    }

    async findCartByUser(userId: string): Promise<Either<Error, Cart>> {
        try {
            const cartRecord = await this.prisma.cart.findFirst({
                where: { userId },
                include: { items: true },
            });

            if (!cartRecord) {
                return left(new Error("Cart not found"));
            }

            const cartItems = cartRecord.items.map((item) =>
                CartItem.create(
                    {
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                        height: item.height,
                        width: item.width,
                        length: item.length,
                        weight: item.weight,
                        color: item.colorId
                            ? item.colorId.toString()
                            : undefined,
                        size: item.sizeId ? item.sizeId.toString() : undefined,
                    },
                    new UniqueEntityID(item.id)
                )
            );

            const cart = Cart.create(
                {
                    userId: cartRecord.userId,
                    items: cartItems,
                },
                new UniqueEntityID(cartRecord.id)
            );

            return right(cart);
        } catch (error) {
            return left(new Error("Failed to fetch cart"));
        }
    }

    async save(cart: Cart): Promise<Either<Error, void>> {
        try {
            const cartData = cart.toObject();

            const cartSaved = await this.prisma.cart.update({
                where: { id: cartData.id.toString() },
                data: {
                    userId: cartData.userId,
                    items: {
                        upsert: cartData.items.map((item) => ({
                            where: { id: item.id },
                            update: {
                                quantity: item.quantity,
                                price: item.price,
                                height: item.height,
                                width: item.width,
                                length: item.length,
                                weight: item.weight,
                                colorId: item.colorId?.toString(),
                                sizeId: item.sizeId?.toString(),
                            },
                            create: {
                                productId: item.productId,
                                quantity: item.quantity,
                                price: item.price,
                                height: item.height,
                                width: item.width,
                                length: item.length,
                                weight: item.weight,
                                colorId: item.colorId?.toString(),
                                sizeId: item.sizeId?.toString(),
                            },
                        })),
                    },
                },
            });

            return right(undefined);
        } catch (error) {
            return left(new Error("Failed to save cart"));
        }
    }

    async cartExists(userId: string): Promise<Either<Error, boolean>> {
        try {
            const cartRecord = await this.prisma.cart.findFirst({
                where: { userId },
            });

            return right(!!cartRecord);
        } catch (error) {
            return left(new Error("Failed to check if cart exists"));
        }
    }

    async removeItemFromCart(
        cartId: string,
        itemId: string
    ): Promise<Either<Error, void>> {
        try {
            await this.prisma.cart.update({
                where: { id: cartId },
                data: {
                    items: {
                        delete: { id: itemId },
                    },
                },
            });
            return right(undefined);
        } catch (error) {
            return left(new Error("Failed to remove item from cart"));
        }
    }

    async findById(cartId: string): Promise<Either<Error, Cart>> {
        try {
            const cartData = await this.prisma.cart.findUnique({
                where: { id: cartId },
                include: {
                    items: true,
                },
            });

            if (!cartData) {
                return left(new ResourceNotFoundError("Cart not found"));
            }

            const cartItems = cartData.items.map(
                (item) =>
                    new CartItem(
                        {
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                            height: item.height,

                            width: item.width,
                            length: item.length,
                            weight: item.weight,
                            color: item.colorId || "undefined",
                            size: item.sizeId || "undefined",
                        },
                        new UniqueEntityID(item.id)
                    )
            );

            const cart = Cart.create(
                {
                    userId: cartData.userId,
                    items: cartItems,
                },
                new UniqueEntityID(cartData.id)
            );

            return right(cart);
        } catch (error) {
            return left(new ResourceNotFoundError("Failed to fetch cart"));
        }
    }
}
