import { Either, left, right } from "@/core/either";
import { Injectable } from "@nestjs/common";
import { ICartRepository } from "../repositories/i-cart-repository";

import { Cart } from "../../enterprise/entities/cart";
import { CartItem } from "../../enterprise/entities/cart-item";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { IProductRepository } from "@/domain/catalog/application/repositories/i-product-repository";
import { IProductVariantRepository } from "@/domain/catalog/application/repositories/i-product-variant-repository";

interface CreateCartUseCaseRequest {
    userId: string;
    items: {
        productId: string;
        quantity: number;
        price: number;
        colorId?: string;
        sizeId?: string;
        productIdVariant?: string;
        hasVariants?: boolean;
    }[];
}

type CreateCartUseCaseResponse = Either<
    ResourceNotFoundError | null,
    {
        cart: Cart;
    }
>;

@Injectable()
export class CreateCartUseCase {
    constructor(
        private cartRepository: ICartRepository,
        private productRepository: IProductRepository,
        private variantRepository: IProductVariantRepository
    ) {}

    async execute({
        userId,
        items,
    }: CreateCartUseCaseRequest): Promise<CreateCartUseCaseResponse> {
        try {
            const cartItemsMap: { [productId: string]: CartItem } = {};
            console.log('entrou no CreateCartUseCase  userId',userId)

            for (const item of items) {
                if (item.quantity <= 0) {
                    return left(
                        new ResourceNotFoundError(
                            "Quantity must be greater than zero"
                        )
                    );
                }

                console.log("create cart inicio item", item);
                console.log(
                    "create cart inicio productIdVariant",
                    item.productIdVariant
                );
                console.log("create cart inicio hasVariants", item.hasVariants);
                console.log(
                    "create cart inicio item product id",
                    item.productId
                );

                let productResult;
                let variant;
                let productIdFromVariant = item.productId || "undefined";
                let productIdFromVarianttoproduct =
                    item.productIdVariant || "undefined";
                console.log(
                    "create cart inicio productIdFromVariant",
                    productIdFromVariant
                );

                if (item.hasVariants) {
                    const variantResult =
                        await this.variantRepository.findById(
                            productIdFromVariant
                        );

                    console.log("variantResult value", variantResult.value);

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

                    productResult = await this.productRepository.findById(
                        productIdFromVarianttoproduct
                    );

                    const { product, variants } = productResult.value;

                    const { height, width, length, weight } = variants.props;

                    if (cartItemsMap[productIdFromVarianttoproduct]) {
                        const existingItem =
                            cartItemsMap[productIdFromVarianttoproduct];
                        existingItem.setQuantity(
                            existingItem.quantity + item.quantity
                        );
                    } else {
                        
                        cartItemsMap[productIdFromVarianttoproduct] =
                            new CartItem({
                                productId: productIdFromVariant,
                                productIdVariant: item.productIdVariant,
                                quantity: item.quantity,
                                price: item.price,
                                height: height,
                                width: width,
                                length: length,
                                weight: weight,
                                color: item.colorId,
                                size: item.sizeId,
                            });
                    }
                } else {
                    productResult = await this.productRepository.findById(
                        item.productId
                    );

                    const { product, variants } = productResult.value;

                    if (productResult.isLeft()) {
                        return left(
                            new ResourceNotFoundError(
                                `Product not found: ${item.productId}`
                            )
                        );
                    }

                    if (product.stock < item.quantity) {
                        return left(
                            new ResourceNotFoundError(
                                `Insufficient stock for product: ${item.productId}`
                            )
                        );
                    }

                    const { height, width, length, weight } = product.props;

                    if (cartItemsMap[item.productId]) {
                        const existingItem = cartItemsMap[item.productId];
                        existingItem.setQuantity(
                            existingItem.quantity + item.quantity
                        );
                    } else {
                        cartItemsMap[item.productId] = new CartItem({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                            height,
                            width,
                            length,
                            weight,
                            color: item.colorId,
                            size: item.sizeId,
                        });
                    }
                }
            }

            const cartItems = Object.values(cartItemsMap);
            
            console.log('quase saindo no CreateCartUseCase  userId',userId)

            const cart = Cart.create({ userId, items: cartItems });

            await this.cartRepository.create(cart);

            return right({ cart });
        } catch (error) {
            return left(error as Error);
        }
    }
}
