import { Either, left, right } from "@/core/either";
import { ICartRepository } from "../repositories/i-cart-repository";
import { Injectable } from "@nestjs/common";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";

interface DeleteItemFromCartRequest {
  cartId: string;
  itemId: string;
}

type DeleteItemFromCartResponse = Either<ResourceNotFoundError, void>;

@Injectable()
export class DeleteItemFromCartUseCase {
  constructor(private cartRepository: ICartRepository) {}

  async execute({
    cartId,
    itemId,
  }: DeleteItemFromCartRequest): Promise<DeleteItemFromCartResponse> {
    const cartResult = await this.cartRepository.findById(cartId);

    if (cartResult.isLeft()) {
      return left(new ResourceNotFoundError("Cart not found"));
    }

    const cart = cartResult.value;

    const itemExists = cart.items.some(item => item.id.toString() === itemId);

    if (!itemExists) {
      return left(new ResourceNotFoundError("Item not found in cart"));
    }

    const result = await this.cartRepository.removeItemFromCart(cartId, itemId);

    if (result.isLeft()) {
      return left(new Error("Failed to remove item from cart"));
    }

    return right(undefined);
  }
}
