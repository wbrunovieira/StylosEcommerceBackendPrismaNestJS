import { Either, left, right } from "@/core/either";
import { Injectable } from "@nestjs/common";
import { PrismaArchivedCartRepository } from "@/infra/database/prisma/repositories/prisma-archived-cart-repository";

import { ArchivedCart } from "../../enterprise/entities/archived-cart";
import { Cart } from "../../enterprise/entities/cart";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { CartItem } from "../../enterprise/entities/cart-item";

import { IArchivedCartRepository } from "../repositories/i-archived-cart";

export interface ArchiveCartRequest {
    archivedCart: ArchivedCart;
}

interface ArchiveCartRequestConvert {
    cart: {
        userId: string;
        items: {
            productId: string;
            productName: string;
            imageUrl: string;
            quantity: number;
            price: number;
        }[];
        paymentIntentId?: string;
        paymentStatus?: string;
        collection_id?: string;
        merchant_order_id?: string;
    };
    archivedAt: Date;
}

type ArchiveCartResponse = Either<Error, void>;

export function mapCartToArchiveCartRequest(cart: Cart): ArchivedCart {
    const archivedItems = cart.items.map((item) =>
        CartItem.create(
            {
                cartId: cart.id.toString(),
                productId: item.productId,
                productName: item.productName,
                imageUrl: item.imageUrl,
                quantity: item.quantity,
                price: item.price,
                height: item.height,
                width: item.width,
                length: item.length,
                weight: item.weight,
                hasVariants: item.hasVariants,
                productIdVariant: item.productIdVariant,
                color: item.color,
                size: item.size,
            },
            new UniqueEntityID(item.id.toString())
        )
    );

    return ArchivedCart.create(
        {
            userId: cart.userId,
            cartId: cart.id.toString(),
            items: archivedItems,
            paymentIntentId: cart.paymentIntentId,
            paymentStatus: cart.paymentStatus,
            collection_id: cart.collection_id,
            merchant_order_id: cart.merchant_order_id,
            archivedAt: new Date(),
        },
        new UniqueEntityID()
    );
}

@Injectable()
export class ArchiveCartUseCase {
    constructor(private archivedCartRepository: IArchivedCartRepository) {}

    async execute(request: ArchiveCartRequest): Promise<ArchiveCartResponse> {
        const { archivedCart } = request;

        const archiveResult =
            await this.archivedCartRepository.archive(archivedCart);
        if (archiveResult.isLeft()) {
            return left(archiveResult.value);
        }

        return right(undefined);
    }
}
