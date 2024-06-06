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
    const productResult = await this.productRepository.findBySlug(slug);

    console.log("productresult", productResult.value);

    if (productResult.isLeft()) {
      return left(new ResourceNotFoundError("Product not found"));
    }

    const product = productResult.value;

    let materialName;
    if (product.materialId) {
      const material = await this.materialRepository.findById(
        product?.materialId?.toString()
      );
      console.log("material", material.value);
      materialName = material?.value.name;
    }
    const brand = await this.brandRepository.findById(
      product.brandId.toString()
    );
    console.log("brand", brand.value);
    const brandName = brand?.value.name;

    product.materialId = materialName;

    // adcionar loop para pegar name das cores de todas os ids de cores para o product
    //colorRepository

    const colorNamesSet = new Set<string>();
    if (product.productColors) {
      for (const colorId of product.productColors) {
        const colorResult = await this.colorRepository.findById(
          colorId.toString()
        );
        if (colorResult.isRight()) {
          colorNamesSet.add(colorResult.value.name);
        }
      }
    }
    const colorNames = Array.from(colorNamesSet);

    const sizeNamesSet = new Set<string>();
    if (product.productSizes) {
      for (const sizeId of product.productSizes) {
        const sizeResult = await this.sizeRepository.findById(
          sizeId.toString()
        );
        if (sizeResult.isRight()) {
          sizeNamesSet.add(sizeResult.value.name);
        }
      }
    }
    const sizeNames = Array.from(sizeNamesSet);

    const categoryNameSet = new Set<string>();
    if (product.productCategories) {
      for (const categoryId of product.productCategories) {
        const categoryResult = await this.categoryRepository.findById(
          categoryId.toString()
        );
        if (categoryResult.isRight()) {
          categoryNameSet.add(categoryResult.value.name);
        }
      }
    }
    const categoryName = Array.from(categoryNameSet);
    // adcionar os resultados no return abaixo

    return right({
      product: productResult.value,
      materialName,
      brandName,
      colorNames,
      sizeNames,
      categoryName,
      //   sizeNames,
      //   categoryName,
      //   variantDetails,
    });
  }
}
