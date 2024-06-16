import { Product } from "../../enterprise/entities/product";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { IProductRepository } from "../repositories/i-product-repository";
import { Injectable } from "@nestjs/common";

interface GetProductsByColorIdUseCaseRequest {
  colorId: string;
}

type GetProductsByColorIdUseCaseResponse = Either<
  ResourceNotFoundError,
  Product[]
>;

@Injectable()
export class GetProductsByColorIdUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute({
    colorId,
  }: GetProductsByColorIdUseCaseRequest): Promise<GetProductsByColorIdUseCaseResponse> {
    console.log("Executing GetProductsByColorIdUseCase");

    const result = await this.productRepository.findByColorId(colorId);

    if (result.isLeft()) {
      return left(new ResourceNotFoundError("Products not found"));
    }

    const products = result.value;

    return right(products);
  }
}
