import { Either, left, right } from "@/core/either";
import { Product } from "../../enterprise/entities/product";
import { IProductRepository } from "../../application/repositories/i-product-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { Injectable } from "@nestjs/common";



@Injectable()
export class GetAllProductsUseCase {
    constructor(private productRepository: IProductRepository) {}

    async execute(): Promise<Either<Error, Product[]>> {

        const productsOrError = await this.productRepository.getAllProducts();

        console.log("GetAllProductsUseCase productsOrError", productsOrError);
        
        if (productsOrError.isLeft()) {
            
                   return left(new ResourceNotFoundError("No products found"));
        }
        
        const products = productsOrError.value;

        console.log("GetAllProductsUseCase products", products);

        if (products.length === 0) {
            return left(new ResourceNotFoundError("No products found"));
        }

        return right(products);
    }
}
