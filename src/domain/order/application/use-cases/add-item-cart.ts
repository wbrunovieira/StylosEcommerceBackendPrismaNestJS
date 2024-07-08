import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { ICartRepository } from "../repositories/i-cart-repository";
import { CartItem } from "../../enterprise/entities/cart-item";
import { Injectable } from "@nestjs/common";

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
    color?: string;
    size?: string;
  };
}

type AddItemToCartResponse = Either<ResourceNotFoundError, void>;

@Injectable()
export class AddItemToCartUseCase {
  constructor(private cartRepository: ICartRepository) {}

  async execute({
    userId,
    item,
  }: AddItemToCartRequest): Promise<AddItemToCartResponse> {

    console.log('AddItemToCartUseCase entrou userId',userId)
    console.log('AddItemToCartUseCase entrou item',item)
    console.log('AddItemToCartUseCase - cartRepository:', this.cartRepository);
    
    const cartResult = await this.cartRepository.findCartByUser(userId);

    console.log('cartResult in AddItemToCartUseCase',cartResult)

    if (cartResult.isLeft()) {
        return left(new ResourceNotFoundError("Cart not found"));
    }

const cart = cartResult.value; 
console.log('cart in AddItemToCartUseCase',cart)

const cartItem = CartItem.create({
  productId: item.productId,
  quantity: item.quantity,
  price: item.price,
  height: item.height,
  width: item.width,
      length: item.length,
      weight: item.weight,
      color: item.color,
      size: item.size,
    });
    console.log('cartItem in AddItemToCartUseCase',cartItem)
    
    cart.addItem(cartItem);
    console.log('cartItem in AddItemToCartUseCase',cart)

    await this.cartRepository.save(cart);

    return right(undefined);
  }
}
