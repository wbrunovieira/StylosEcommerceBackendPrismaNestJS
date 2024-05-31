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
  items: { productId: string; quantity: number; price: number }[];
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
        console.log('item', item)
        if (item.quantity < 0) {
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

        const product = productResult.value;
        if (product.stock < item.quantity) {
          return left(
            new ResourceNotFoundError(
              `Insufficient stock for product: ${item.productId}`
            )
          );
        }

        if (cartItemsMap[item.productId]) {
          const existingItem = cartItemsMap[item.productId];
          existingItem.setQuantity(existingItem.quantity + item.quantity);
        } else {
          cartItemsMap[item.productId] = new CartItem({
            productId: new UniqueEntityID(item.productId),
            quantity: item.quantity,
            price: item.price,
          });
        }
      }

      const cartItems = Object.values(cartItemsMap);

      const cart = Cart.create({ userId, items: cartItems });
      await this.cartRepository.create(cart);

      return right({ cart });
    } catch (error) {
      return left(error as Error);
    }
  }
}
