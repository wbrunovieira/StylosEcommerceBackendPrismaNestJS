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
        console.log("entrou no AddItemToCartUseCase userId item", userId, item);
        const cartResult = await this.cartRepository.findCartByUser(userId);
        console.log(" AddItemToCartUseCase cartResult ", cartResult);

        if (cartResult.isLeft()) {
            return left(new ResourceNotFoundError("Cart not found"));
        }

        const cart = cartResult.value;

        let productResult;
        let variant;
        let productIdToUse;
        let cartItem;
        let colorIdValue;
        let sizeIdValue;

        if (item.hasVariants) {
            console.log(
                "entrou tem variant do add item use case item.hasVariants",
                item.hasVariants
            );
            console.log(
                "entrou tem variant do add item use case item.productId",
                item.productId
            );

            const variantResult = await this.variantRepository.findById(
                item.productId
            );
            console.log(" add item use case variantResult", variantResult);

            if (variantResult.isRight()) {
                const productVariant = variantResult.value;
                if (variantResult.isRight()) {
                    const productVariant = variantResult.value;

                    const colorId = productVariant.colorId;
                    const sizeId = productVariant.sizeId;

                    colorIdValue = colorId ? colorId.toString() : null;
                    sizeIdValue = sizeId ? sizeId.toString() : null;

                    console.log("Color ID:", colorIdValue);
                    console.log("Size ID:", sizeIdValue);
                }
            }

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
            console.log("productIdToUse", productIdToUse);

            productResult =
                await this.productRepository.findById(productIdToUse);

            console.log("productResult", productResult);

            const { product, variants } = productResult.value;

            console.log("product", product);

            if (productResult.isLeft()) {
                return left(
                    new ResourceNotFoundError(
                        `Product not found: ${productIdToUse}`
                    )
                );
            }

            const { height, width, length, weight } = product.props;
            console.log(
                "height, width, length, weight",
                height,
                width,
                length,
                weight
            );

            cartItem = new CartItem({
                productId: productIdToUse,
                quantity: item.quantity,
                price: item.price,
                height,
                width,
                length,
                weight,
                color: colorIdValue,
                size: sizeIdValue,
                hasVariants: item.hasVariants,
            });

            console.log("cartItem", cartItem);
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
            console.log(
                "height, width, length, weight 2",
                height,
                width,
                length,
                weight
            );

            cartItem = new CartItem({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                height,
                width,
                length,
                weight,
                color: colorIdValue,
                size: sizeIdValue,
                hasVariants: item.hasVariants,
            });
        }
        console.log(
            "no final do add item cart quase return cartItem",
            cartItem
        );

        const cartCreated = cart.addItem(cartItem);

        console.log(
            "no final do add item cart quase return cartCreated",
            cartCreated
        );

        const cartSAved =  await this.cartRepository.save(cart);
        console.log(
            "cartSAved",
            cartSAved
        );
        return right(undefined);
    }
}
