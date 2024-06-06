import { Product } from "../../enterprise/entities/product";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { IProductRepository } from "../repositories/i-product-repository";
import { Injectable } from "@nestjs/common";
import { ICategoryRepository } from "../repositories/i-category-repository";
import { IColorRepository } from "../repositories/i-color-repository";
import { IMaterialRepository } from "../repositories/i-material-repository";
import { IProductCategoryRepository } from "../repositories/i-product-category-repository";
import { IProductColorRepository } from "../repositories/i-product-color-repository";
import { IProductSizeRepository } from "../repositories/i-product-size-repository";
import { IProductVariantRepository } from "../repositories/i-product-variant-repository";
import { ISizeRepository } from "../repositories/i-size-repository";
import { IBrandRepository } from "../repositories/i-brand-repository";
import { ProductColorProps } from "../../enterprise/entities/product-color";

interface GetProductBySlugUseCaseRequest {
  slug: string;
}

type GetProductBySlugUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    product: Product;
    materialName?: string;
    brandName?: string;
    colorNames: string[];
    sizeNames: string[];
    categoryName: string[];
    // variantDetails: any[];
  }
>;

@Injectable()
export class GetProductBySlugUseCase {
  constructor(
    private productRepository: IProductRepository,
    private categoryRepository: ICategoryRepository,
    private colorRepository: IColorRepository,
    private materialRepository: IMaterialRepository,
    private productCategoryRepository: IProductCategoryRepository,
    private productColorRepository: IProductColorRepository,
    private productSizeRepository: IProductSizeRepository,
    private productVariantRepository: IProductVariantRepository,
    private sizeRepository: ISizeRepository,
    private brandRepository: IBrandRepository
  ) {}
  pro;
  async execute({
    slug,
  }: GetProductBySlugUseCaseRequest): Promise<GetProductBySlugUseCaseResponse> {
    console.log("entrou no useCase find by slug");
    // const productResult  = await this.productRepository.findBySlug(slug);
    const result = await this.productRepository.findBySlug(slug);

    if (result.isLeft()) {
      return left(new ResourceNotFoundError("Product not found"));
    }

    const { product, materialName, brandName, colorNames, sizeNames, categoryName } = result.value;

      

    return right({
      product,
      materialName,
      brandName,
      colorNames,
      sizeNames,
      categoryName,
    });
  }
}
