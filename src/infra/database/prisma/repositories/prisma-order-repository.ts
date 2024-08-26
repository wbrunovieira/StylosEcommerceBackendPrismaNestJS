import { Either, left, right } from "@/core/either";
import { PrismaService } from "../../../../prisma/prisma.service";
import { Injectable } from "@nestjs/common";

import { Order } from "../../../../domain/order/enterprise/entities/order";

import { IOrderRepository } from "@/domain/order/application/repositories/i-order-repository";
import { OrderStatus } from "@/domain/order/enterprise/entities/order-status";
import { OrderItem } from "@/domain/order/enterprise/entities/order-item";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

@Injectable()
export class PrismaOrderRepository implements IOrderRepository {
    constructor(private prisma: PrismaService) {}

    async create(order: Order): Promise<Either<Error, void>> {
        try {
            const orderData = order.toObject();

            const createdOrder = await this.prisma.order.create({
                data: {
                    id: orderData.id.toString(),
                    userId: orderData.userId,

                    status: orderData.status as OrderStatus,
                    paymentId: orderData.paymentId,
                    paymentStatus: orderData.paymentStatus,
                    paymentMethod: orderData.paymentMethod,
                    paymentDate: orderData.paymentDate,
                    items: {
                        create: orderData.items.map((item) => ({
                            id: item.id?.toString(),
                            productId: item.productId.toString(),
                            productName: item.productName,
                            imageUrl: item.imageUrl,
                            quantity: item.quantity,
                            price: item.price,
                        })),
                    },
                },
            });

            return right(undefined);
        } catch (error) {
            return left(new Error("Failed to create order"));
        }
    }

    async listAllOrders(): Promise<Either<Error, Order[]>> {
        try {
            const orders = await this.prisma.order.findMany({
                include: {
                    items: true,
                },
            });

            const orderEntities = orders.map((order) =>
                Order.create(
                    {
                        userId: order.userId,
                        items: order.items.map((item) =>
                            OrderItem.create({
                                orderId: item.orderId,
                                productId: item.productId,
                                productName: item.productName,
                                imageUrl: item.imageUrl,
                                quantity: item.quantity,
                                price: item.price,
                            })
                        ),
                        status: OrderStatus.PENDING,
                        paymentId: order.paymentId || undefined,
                        paymentStatus: order.paymentStatus || undefined,
                        paymentMethod: order.paymentMethod || undefined,
                        paymentDate: order.paymentDate || undefined,
                    },
                    new UniqueEntityID(order.id)
                )
            );

            return right(orderEntities);
        } catch (error) {
            return left(new Error("Failed to list orders"));
        }
    }
}
