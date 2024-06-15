import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { Product } from "../../enterprise/entities/product";
import { Injectable } from "@nestjs/common";
import { IProductRepository } from "../repositories/i-product-repository";

interface GetProductsByBrandIdUseCaseRequest {
    brandId: string;
  }
  
  type GetProductsByBrandIdUseCaseResponse = Either<
    ResourceNotFoundError,
    Product[]
  >;
  @Injectable()
  export class GetProductsByBrandIdUseCase {
    constructor(private productRepository: IProductRepository) {}
  
    async execute({
      brandId,
    }: GetProductsByBrandIdUseCaseRequest): Promise<GetProductsByBrandIdUseCaseResponse> {
      console.log("entrou no useCase find by brandId");
  
      const result = await this.productRepository.findByBrandId(brandId);
  
      if (result.isLeft()) {
        return left(new ResourceNotFoundError("Products not found"));
      }
  
      const products = result.value;
  
      return right(products);
    }
  }
    