import { Either, left, right } from "@/core/either";
import { PrismaService } from "../../../../prisma/prisma.service";
import { Injectable } from "@nestjs/common";

import { Cart } from "../../../../domain/order/enterprise/entities/cart";
import { ICartRepository } from "@/domain/order/application/repositories/i-cart-repository";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { CartItem } from "@/domain/order/enterprise/entities/cart-item";

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

  async findCartByUser(userId: string): Promise<Either<Error, Cart>> {
    try {
      console.log('PrismaCartRepository findByUserId entrou')
      const cartRecord = await this.prisma.cart.findFirst({
        where: { userId },
        include: { items: true },
      });

      console.log('PrismaCartRepository findByUserId cartRecord',cartRecord)
      
      if (!cartRecord) {
        return left(new Error("Cart not found"));
      }
      
      const cartItems = cartRecord.items.map(item => CartItem.create({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        height: item.height,
        width: item.width,
        length: item.length,
        weight: item.weight,
        color: item.colorId ? item.colorId.toString() : undefined,
        size: item.sizeId ? item.sizeId.toString() : undefined,
      }, new UniqueEntityID(item.id)));
      
      console.log('PrismaCartRepository findByUserId cartItems',cartItems)
      const cart = Cart.create({
        userId: cartRecord.userId,
        items: cartItems,
      }, new UniqueEntityID(cartRecord.id));
      
      console.log('PrismaCartRepository findByUserId cart',cart)
         
     
      return right(cart);
    } catch (error) {
      return left(new Error("Failed to fetch cart"));
    }
  }

  async save(cart: Cart): Promise<Either<Error, void>> {
    try {
      const cartData = cart.toObject();
  
      await this.prisma.cart.update({
        where: { id: cartData.id.toString() },
        data: {
          userId: cartData.userId,
          items: {
            upsert: cartData.items.map(item => ({
              where: { id: item.id },
              update: {
                quantity: item.quantity,
                price: item.price,
                height: item.height,
                width: item.width,
                length: item.length,
                weight: item.weight,
                colorId: item.color?.toString(),
                sizeId: item.size?.toString(),
              },
              create: {
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                height: item.height,
                width: item.width,
                length: item.length,
                weight: item.weight,
                colorId: item.color?.toString(),
                sizeId: item.size?.toString(),
              },
            })),
          },
        },
      });
  
      return right(undefined);
    } catch (error) {
      return left(new Error("Failed to save cart"));
    }
  }

  async cartExists(userId: string): Promise<Either<Error, boolean>> {
    try {
      const cartRecord = await this.prisma.cart.findFirst({
        where: { userId },
      });

      return right(!!cartRecord);
      
    } catch (error) {
      return left(new Error("Failed to check if cart exists"));
    }
  }


}
