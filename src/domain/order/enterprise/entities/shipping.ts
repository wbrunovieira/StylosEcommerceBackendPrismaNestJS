import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

interface ShippingProps {
    userId: string;
    name: string;
    orderId?: string;

    service?: string;
    trackingCode?: string;
    shippingCost: number;
    deliveryTime: number;
    status: ShippingStatus;
}

export enum ShippingStatus {
    PENDING = "PENDING",
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
}

export class Shipping extends Entity<ShippingProps> {
    constructor(props: ShippingProps, id?: UniqueEntityID) {
        super(props, id || new UniqueEntityID());
    }

    static create(props: ShippingProps, id?: UniqueEntityID): Shipping {
        return new Shipping(props, id);
    }

    get userId(): string {
        return this.props.userId;
    }
    get name(): string {
        return this.props.name;
    }
    get trackingCode(): string | undefined {
        return this.props.trackingCode;
    }

    get orderId(): string | undefined {
        return this.props.orderId;
    }

    get service(): string | undefined {
        return this.props.service;
    }

    get shippingCost(): number {
        return this.props.shippingCost;
    }
    get deliveryTime(): number {
        return this.props.deliveryTime;
    }
    get status(): ShippingStatus {
        return this.props.status;
    }
}
