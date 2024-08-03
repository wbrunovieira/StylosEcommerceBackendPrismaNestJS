import { Either, left, right } from "@/core/either";
import { PrismaService } from "../../../../prisma/prisma.service";
import { Injectable } from "@nestjs/common";

import { Order } from "../../../../domain/order/enterprise/entities/order";

import { IOrderRepository } from "@/domain/order/application/repositories/i-order-repository";
import { OrderStatus } from "@/domain/order/enterprise/entities/order-status";

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
}
