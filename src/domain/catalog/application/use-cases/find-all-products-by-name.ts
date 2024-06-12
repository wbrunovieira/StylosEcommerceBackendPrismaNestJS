import { Product } from "../../enterprise/entities/product";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { IProductRepository } from "../repositories/i-product-repository";
import { Injectable } from "@nestjs/common";

interface FindProductByNameUseCaseRequest {
  name: string;
}

type FindProductByNameUseCaseResponse = Either<
  ResourceNotFoundError,
  Product[]
>;

@Injectable()
export class FindProductByNameUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute({
    name,
  }: FindProductByNameUseCaseRequest): Promise<FindProductByNameUseCaseResponse> {
    console.log("Finding products by name", name);

    const result = await this.productRepository.findByName(name);

    console.log("Finding products by name result", result);

    if (result.isLeft()) {
      return left(new ResourceNotFoundError("Products not found"));
    }

    const products = result.value;

    
    return right(products);
  }
}
