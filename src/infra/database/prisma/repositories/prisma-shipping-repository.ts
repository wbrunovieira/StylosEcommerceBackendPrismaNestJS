import { Injectable } from "@nestjs/common";

import { Either, left, right } from "@/core/either";
import { PrismaService } from "@/prisma/prisma.service";
import { Shipping, ShippingStatus } from "@/domain/order/enterprise/entities/shipping";
import { IShippingRepository } from "@/domain/order/application/repositories/i-shipping-repository";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

@Injectable()
export class ShippingRepository implements IShippingRepository {
    constructor(private prisma: PrismaService) {}

    async create(shipping: Shipping): Promise<Either<Error, void>> {
        try {
            await this.prisma.shipping.create({
                data: {
                    id: shipping.id.toString(),
                    userId: shipping.userId,
                    orderId: shipping.orderId || null,
                    name: shipping.name,
                    service: shipping.service,
                    trackingCode: shipping.trackingCode || null,
                    shippingCost: shipping.shippingCost,
                    deliveryTime: shipping.deliveryTime,
                    status: shipping.status,
                },
            });

            return right(undefined);
        } catch (error) {
            return left(new Error("Failed to create shipping"));
        }
    }
}
