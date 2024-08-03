import { Either, left, right } from "@/core/either";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { IOrderRepository } from "@/domain/order/application/repositories/i-order-repository";
import { Order } from "@/domain/order/enterprise/entities/order";
import { OrderItem } from "@/domain/order/enterprise/entities/order-item";
import { OrderStatus } from "@/domain/order/enterprise/entities/order-status";
import { Injectable } from "@nestjs/common";

interface CreateOrderRequest {
    userId: string;
    items: {
        productId: string;
        productName: string;
        imageUrl: string;
        quantity: number;
        price: number;
    }[];

    status: OrderStatus;
    paymentId?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    paymentDate?: Date;
}

type CreateOrderResponse = Either<Error, void>;

@Injectable()
export class CreateOrderUseCase {
    constructor(private orderRepository: IOrderRepository) {}

    async execute(request: CreateOrderRequest): Promise<CreateOrderResponse> {
        const items = request.items.map((item) =>
            OrderItem.create({
                orderId: new UniqueEntityID().toString(),
                productId: item.productId,
                productName: item.productName,
                imageUrl: item.imageUrl,
                quantity: item.quantity,
                price: item.price,
            })
        );

        const order = Order.create({
            userId: request.userId,
            items: items,

            status: request.status,
            paymentId: request.paymentId,
            paymentStatus: request.paymentStatus,
            paymentMethod: request.paymentMethod,
            paymentDate: request.paymentDate,
        });

        return this.orderRepository.create(order);
    }
}
