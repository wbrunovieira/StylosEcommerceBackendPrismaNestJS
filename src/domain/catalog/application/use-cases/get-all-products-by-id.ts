
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { IProductRepository } from "../repositories/i-product-repository";
import { Injectable } from "@nestjs/common";
import { ProductWithVariants } from "../../enterprise/entities/productWithVariants";

interface GetAllProductsByIdUseCaseRequest {
  productId: string;
}

type GetAllProductsByIdUseCaseResponse = Either<
  ResourceNotFoundError,
  ProductWithVariants
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

    const productWithVariants = result.value;

    return right(productWithVariants);
  }
}
