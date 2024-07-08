import { Either, left, right } from "@/core/either";
import { PrismaService } from "../../../../prisma/prisma.service";
import { Injectable } from "@nestjs/common";

import { Cart } from "../../../../domain/order/enterprise/entities/cart";
import { ICartRepository } from "@/domain/order/application/repositories/i-cart-repository";

@Injectable()
export class PrismaCartRepository implements ICartRepository {
  constructor(private prisma: PrismaService) {}

  async create(cart: Cart): Promise<Either<Error, void>> {
    try {
      const cartData = cart.toObject();
      console.log('entrou no prisma cart com:',cartData )
      console.log('entrou no prisma cart com:',cartData.items )
      const createdCart =  await this.prisma.cart.create({
        data: {
          id: cartData.id.toString(),
          userId: cartData.userId,
          items: {
            create: cartData.items.map((item) => ({
              productId: item.productId.toString(),
              quantity: item.quantity,
              price: item.price,
              height: item.height,
              width: item.width,
              length: item.length,
              weight: item.weight,
              colorId: item.color?.toString(), 
              sizeId: item.size?.toString(),   
            })),
          },
        },
      });
      console.log('entrou no prisma cart e crioo cart createdCart',createdCart)

      return right(undefined);
    } catch (error) {
      return left(new Error("Failed to create cart"));
    }
  }
}
