
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { IProductRepository } from "../repositories/i-product-repository";
import { Injectable } from "@nestjs/common";

import { Product } from "../../enterprise/entities/product";

interface GetAllProductsByIdUseCaseRequest {
  productId: string;
}

type GetAllProductsByIdUseCaseResponse = Either<
  ResourceNotFoundError,
  Product
>;

@Injectable()
export class GetAllProductsByIdUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute({
    productId,
  }: GetAllProductsByIdUseCaseRequest): Promise<GetAllProductsByIdUseCaseResponse> {
   

    const result = await this.productRepository.findById(productId);

    if (result.isLeft()) {
      return left(new ResourceNotFoundError("Product not found"));
    }

    const product = result.value;
   
    if (!product.showInSite) {
      return left(new ResourceNotFoundError("Product not available for display"));
    }

    return right(product);
  }
}
