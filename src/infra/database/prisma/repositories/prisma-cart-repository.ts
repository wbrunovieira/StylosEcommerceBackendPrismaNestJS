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
      await this.prisma.cart.create({
        data: {
          id: cart.id.toString(),
          userId: cart.userId,

          items: {
            create: cart.items.map((item) => ({
              productId: item.productId.toString(),
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });
      return right(undefined);
    } catch (error) {
      return left(new Error("Failed to create cart"));
    }
  }
}
