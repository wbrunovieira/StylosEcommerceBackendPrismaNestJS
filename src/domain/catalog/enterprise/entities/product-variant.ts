import { AggregateRoot } from "@/core/entities/aggregate-root";
import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";
import { ProductStatus } from "@prisma/client";

export interface ProductVariantProps {
  productId: UniqueEntityID;
  colorId?: UniqueEntityID;
  sizeId?: UniqueEntityID;
  sku?: string;
  upc?: string;
  stock: number;
  price: number;
  images: string[];
  status: ProductStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ProductVariant extends Entity<ProductVariantProps> {
  private touch() {
    this.props.updatedAt = new Date();
  }

  get productId(): UniqueEntityID {
    return this.props.productId;
  }

  get colorId(): UniqueEntityID | undefined {
    return this.props.colorId;
  }

  get sizeId(): UniqueEntityID | undefined {
    return this.props.sizeId;
  }

  get sku(): string {
    return this.props.sku!;
  }

  get upc(): string | undefined {
    return this.props.upc;
  }

  get stock(): number {
    return this.props.stock;
  }

  get price(): number {
    return this.props.price;
  }

  get images(): string[] {
    return this.props.images;
  }

  get createdAt(): Date {
    return this.props.createdAt!;
  }

  get updatedAt(): Date {
    return this.props.updatedAt!;
  }

  get status(): ProductStatus {
    return this.props.status;
  }

  static create(
    props: Optional<ProductVariantProps, "createdAt" | "updatedAt">,
    id?: UniqueEntityID
  ): ProductVariant {
    const now = new Date();
    const product = new ProductVariant(
      {
        ...props,
        createdAt: props.createdAt || now,
        updatedAt: props.updatedAt || now,
      },
      id
    );
    return product;
  }
}
