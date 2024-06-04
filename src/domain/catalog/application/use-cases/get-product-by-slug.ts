import { Product } from "../../enterprise/entities/product";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { IProductRepository } from "../repositories/i-product-repository";
import { Injectable } from "@nestjs/common";

interface GetProductBySlugUseCaseRequest {
  slug: string;
}

type GetProductBySlugUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    product: Product;
  }
>;

@Injectable()
export class GetProductBySlugUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute({
    slug,
  }: GetProductBySlugUseCaseRequest): Promise<GetProductBySlugUseCaseResponse> {
    const productResult = await this.productRepository.findBySlug(slug);

    if (productResult.isLeft()) {
      return left(new ResourceNotFoundError("Product not found"));
    }

    return right({
      product: productResult.value,
    });
  }
}
