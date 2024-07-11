import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { ICartRepository } from "../repositories/i-cart-repository";
import { CartItem } from "../../enterprise/entities/cart-item";
import { Injectable } from "@nestjs/common";
import { IProductVariantRepository } from "@/domain/catalog/application/repositories/i-product-variant-repository";
import { IProductRepository } from "@/domain/catalog/application/repositories/i-product-repository";

interface AddItemToCartRequest {
    userId: string;
    item: {
        productId: string;
        quantity: number;
        price: number;
        height: number;
        width: number;
        length: number;
        weight: number;
        colorId?: string;
        sizeId?: string;
        hasVariants: boolean;
    };
}

type AddItemToCartResponse = Either<ResourceNotFoundError, void>;

@Injectable()
export class AddItemToCartUseCase {
    constructor(
        private cartRepository: ICartRepository,
        private productRepository: IProductRepository,
        private variantRepository: IProductVariantRepository
    ) {}

    async execute({
        userId,
        item,
    }: AddItemToCartRequest): Promise<AddItemToCartResponse> {
        const cartResult = await this.cartRepository.findCartByUser(userId);

        if (cartResult.isLeft()) {
            return left(new ResourceNotFoundError("Cart not found"));
        }

        const cart = cartResult.value;

        let productResult;
        let variant;
        let productIdToUse;
        let cartItem;

        if (item.colorId && item.sizeId) {
            const variantResult = await this.variantRepository.findById(
                item.productId
            );

            if (variantResult.isLeft()) {
                return left(
                    new ResourceNotFoundError(
                        `Variant not found: ${item.productId}`
                    )
                );
            }
            variant = variantResult.value;

            if (variant.stock < item.quantity) {
                return left(
                    new ResourceNotFoundError(
                        `Insufficient stock for variant: ${item.productId}`
                    )
                );
            }

            productIdToUse = String(variant.props.productId.value);

            productResult =
                await this.productRepository.findById(productIdToUse);
            const { product, variants } = productResult.value;

            if (productResult.isLeft()) {
                return left(
                    new ResourceNotFoundError(
                        `Product not found: ${productIdToUse}`
                    )
                );
            }

            const { height, width, length, weight } = product.props;

            cartItem = new CartItem({
                productId: productIdToUse,
                quantity: item.quantity,
                price: item.price,
                height,
                width,
                length,
                weight,
                color: item.colorId,
                size: item.sizeId,
                hasVariants: item.hasVariants,
            });
        } else {
            productResult = await this.productRepository.findById(
                item.productId
            );
            if (productResult.isLeft()) {
                return left(
                    new ResourceNotFoundError(
                        `Product not found: ${item.productId}`
                    )
                );
            }

            const { product, variants } = productResult.value;

            const { height, width, length, weight } = product.props;

            cartItem = new CartItem({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                height,
                width,
                length,
                weight,
                color: item.colorId,
                size: item.sizeId,
                hasVariants: item.hasVariants,
            });
        }

        cart.addItem(cartItem);

        return right(undefined);
    }
}
