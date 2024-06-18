import { Either, left, right } from "@/core/either";
import { Injectable } from "@nestjs/common";
import { ICartRepository } from "../repositories/i-cart-repository";

import { Cart } from "../../enterprise/entities/cart";
import { CartItem } from "../../enterprise/entities/cart-item";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { IProductRepository } from "@/domain/catalog/application/repositories/i-product-repository";

interface CreateCartUseCaseRequest {
  userId: string;
  items: {
    productId: string;
    quantity: number;
    variantId?: string; // Adicionando o variantId
    price: number;
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
    private productRepository: IProductRepository
  ) {}

  async execute({
    userId,
    items,
  }: CreateCartUseCaseRequest): Promise<CreateCartUseCaseResponse> {
    try {
      const cartItemsMap: { [productId: string]: CartItem } = {};

      for (const item of items) {
        if (item.quantity <= 0) {
          return left(
            new ResourceNotFoundError("Quantity must be greater than zero")
          );
        }

        const productResult = await this.productRepository.findById(
          item.productId
        );

        if (productResult.isLeft()) {
          return left(
            new ResourceNotFoundError(`Product not found: ${item.productId}`)
          );
        }

        const productWithVariants = productResult.value;
        const product = productWithVariants.product;

        // Verifica se há variantes
        let variant;
        if (item.variantId) {
          variant = productWithVariants.variants.find(
            (v) => v.id.toString() === item.variantId
          );

          if (!variant) {
            return left(
              new ResourceNotFoundError(
                `Variant not found: ${item.variantId}`
              )
            );
          }

          if (variant.stock < item.quantity) {
            return left(
              new ResourceNotFoundError(
                `Insufficient stock for variant: ${item.variantId}`
              )
            );
          }
        } else {
          if (product.stock < item.quantity) {
            return left(
              new ResourceNotFoundError(
                `Insufficient stock for product: ${item.productId}`
              )
            );
          }
        }

        const height = variant ? variant.height : product.height;
        const width = variant ? variant.width : product.width;
        const length = variant ? variant.length : product.length;
        const weight = variant ? variant.weight : product.weight;
        const stock = variant ? variant.stock : product.stock;

        if (cartItemsMap[item.productId]) {
          const existingItem = cartItemsMap[item.productId];
          existingItem.setQuantity(existingItem.quantity + item.quantity);
        } else {
          cartItemsMap[item.productId] = new CartItem({
            productId: new UniqueEntityID(item.productId),
            quantity: item.quantity,
            price: item.price,
            height: height,
            width: width,
            length: length,
            weight: weight,
          });
        }
      }

      const cartItems = Object.values(cartItemsMap);
      console.log("cartItems", cartItems);

      const cart = Cart.create({ userId, items: cartItems });
      console.log("cart in usecase", cart);
      await this.cartRepository.create(cart);

      return right({ cart });
    } catch (error) {
      return left(error as Error);
    }
  }
}
