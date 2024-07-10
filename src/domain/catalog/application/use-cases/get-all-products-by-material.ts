import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { Product } from "../../enterprise/entities/product";
import { Injectable } from "@nestjs/common";
import { IProductRepository } from "../repositories/i-product-repository";

interface GetProductsByMaterialIdUseCaseRequest {
  materialId: string;
}

type GetProductsByMaterialIdUseCaseResponse = Either<
  ResourceNotFoundError,
  Product[]
>;

@Injectable()
export class GetProductsByMaterialIdUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute({
    materialId,
  }: GetProductsByMaterialIdUseCaseRequest): Promise<GetProductsByMaterialIdUseCaseResponse> {
    

    const result = await this.productRepository.findByMaterialId(materialId);

    if (result.isLeft()) {
      return left(new ResourceNotFoundError("Products not found"));
    }

    const products = result.value;

    return right(products);
  }
}
