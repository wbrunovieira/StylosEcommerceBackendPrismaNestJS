import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";

import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { Shipping, ShippingStatus } from "../../enterprise/entities/shipping";

import { IShippingRepository } from "../repositories/i-shipping-repository";

interface CreateShippingUseCaseRequest {
    userId: string;
    name: string;
    orderId?: string;

    service: string;
    trackingCode?: string;
    shippingCost: number;
    deliveryTime: number;
}

type CreateShippingUseCaseResponse = Either<
    ResourceNotFoundError | null,
    {
        shipping: Shipping;
    }
>;

@Injectable()
export class SaveShippingUseCase {
    constructor(private shippingRepository: IShippingRepository) {}

    async execute({
        userId,
        name,
        orderId,
        service,
        trackingCode,
        shippingCost,
        deliveryTime,
    }: CreateShippingUseCaseRequest): Promise<CreateShippingUseCaseResponse> {
        try {
            const shipping = Shipping.create({
                userId,
                name,
                orderId,
                service,
                trackingCode,
                shippingCost,
                deliveryTime,
                status: ShippingStatus.PENDING,
            });

            await this.shippingRepository.create(shipping);
            return right({
                shipping,
            });
        } catch (error) {
            return left(new Error("Failed to save shipping option"));
        }
    }
}
