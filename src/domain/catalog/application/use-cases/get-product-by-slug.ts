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
    materialName?: string;
    brandName?: string;
    colors: { id: string; name: string; hex: string }[];
    sizes: { id: string; name: string }[];
    categories: { id: string; name: string }[];
    variants: {
      id: string;
      sizeId?: string;
      colorId?: string;
      stock: number;
      price: number;
      images: string[];
      sku: string;
    }[];
  }
>;

@Injectable()
export class GetProductBySlugUseCase {
  constructor(private productRepository: IProductRepository) {}
  pro;
  async execute({
    slug,
  }: GetProductBySlugUseCaseRequest): Promise<GetProductBySlugUseCaseResponse> {
    console.log("entrou no useCase find by slug");

    const result = await this.productRepository.findBySlug(slug);

    if (result.isLeft()) {
      return left(new ResourceNotFoundError("Product not found"));
    }

    const {
      product,
      materialName,
      brandName,
      colors,
      sizes,
      categories,
      variants,
    } = result.value;

    return right({
      product,
      materialName,
      brandName,
      colors,
      sizes,
      categories,
      variants,
    });
  }
}
