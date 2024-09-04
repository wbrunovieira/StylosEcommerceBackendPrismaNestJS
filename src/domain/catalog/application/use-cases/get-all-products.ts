import { Either, left, right } from "@/core/either";
import { Product } from "../../enterprise/entities/product";
import { IProductRepository } from "../../application/repositories/i-product-repository";

import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { Injectable } from "@nestjs/common";

import dayjs from "dayjs";

export interface ProductObject {
    id: string;
    name: string;
    description: string;
    price: number;
    finalPrice?: number;
    stock: number;
    brandName?: string;
    brandUrl?: string;
    discount?: number;
    height: number;
    width: number;
    length: number;
    weight: number;
    onSale?: boolean;
    isFeatured?: boolean;
    isNew?: boolean;
    images?: string[];
    slug: string;
    createdAt: Date;
    updatedAt: Date;
    productCategories?: { id: string; name: string }[];
    productColors?: { id: string; name: string; hex: string }[];
    productSizes?: { id: string; name: string }[];
}

export type GetAllProductsUseCaseResponse = Either<Error, ProductObject[]>;

@Injectable()
export class GetAllProductsUseCase {
    constructor(private productRepository: IProductRepository) {}

    async execute(): Promise<GetAllProductsUseCaseResponse> {
        const productsOrError = await this.productRepository.getAllProducts();

        console.log("GetAllProductsUseCase productsOrError", productsOrError);

        if (productsOrError.isLeft()) {
            return left(new ResourceNotFoundError("No products found"));
        }

        const now = dayjs();
        console.log("Current date using dayjs:", now.format());

        const products = productsOrError.value;
        console.log("Products before mapping:", products);

        const productsObject = products.map((product) => {
            console.log(
                "Converted ProductObject in real callproduct:",
                product
            );
            const obj = product.toObject();
            console.log("Converted ProductObject in real call:", obj);
            return obj;
        });

        console.log("GetAllProductsUseCase products", products);

        if (products.length === 0) {
            return left(new ResourceNotFoundError("No products found"));
        }

        return right(productsObject);
    }
}
