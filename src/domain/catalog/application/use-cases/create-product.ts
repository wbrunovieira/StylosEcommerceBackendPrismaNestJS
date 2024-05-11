import { Either, left, right } from "@/core/either";
import { Product } from "../../enterprise/entities/product";

import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import { ResourceNotFoundError } from "./errors/resource-not-found-error";

import { IProductRepository } from "../repositories/i-product-repository";
import { IProductColorRepository } from "../repositories/i-product-color-repository";
import { IProductSizeRepository } from "../repositories/i-product-size-repository";
import { IProductCategoryRepository } from "../repositories/i-product-category-repository";
import { IBrandRepository } from "../repositories/i-brand-repository";
import { IMaterialRepository } from "../repositories/i-material-repository";



interface CreateProductUseCaseRequest {
  name: string;
  description: string;
  productColors?: string[];
  productSizes?: string[];
  productCategories?: string[];
  materialId?: string;
  brandId: string;
  price: number;
  stock: number;
  height?: number | null;
  width?: number | null;
  length?: number | null;
  weight?: number | null;
  onSale?: boolean;
  discount?: number;
  isFeatured?: boolean;
  isNew?: boolean;
  images?: string[];
}

type CreateProductUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    product: Product;
  }
>;
export class CreateProductUseCase {
  constructor(
    private productRepository: IProductRepository,
    private productColorRepository: IProductColorRepository,
    private productSizeRepository: IProductSizeRepository,
    private productCategoryRepository: IProductCategoryRepository,

    private brandRepository: IBrandRepository,
    private materialRepository: IMaterialRepository
  ) {}

  async execute({
    name,
    description,
    productColors,
    productSizes,
    productCategories,
    materialId,
    brandId,
    price,
    stock,
    height = null,
    width = null,
    length = null,
    weight = null,
    onSale = false,
    discount = 0,
    isFeatured = false,
    isNew = false,
    images = [],
  }: CreateProductUseCaseRequest): Promise<CreateProductUseCaseResponse> {
    if (!name.trim()) {
      return left(new ResourceNotFoundError("Product name is required"));
    }

    if (stock < 0) {
      return left(new ResourceNotFoundError("Stock cannot be negative"));
    }

    const brandResult = await this.brandRepository.findById(brandId);

    if (brandResult.isLeft()) {
     
      return left(new ResourceNotFoundError("Brand not found"));
    }

    const brand = brandResult.value;

    if (materialId) {
      const material = await this.materialRepository.findById(materialId);
      if (!material) {
        return left(new ResourceNotFoundError());
      }
    }

    const product = Product.create({
      name,
      description,
      materialId: new UniqueEntityID(materialId),
      brandId: new UniqueEntityID(brandId),
      price,
      stock,
      height,
      width,
      length,
      weight,
      onSale,
      discount,
      isFeatured,
      isNew,
      images,
    });

    await this.productRepository.create(product);

    if (productColors) {
      for (const colorId of productColors) {
        const idAsString = product.id.toString();
        await this.productColorRepository.create(idAsString, colorId);
      }
    }
    if (productSizes) {
      for (const sizeId of productSizes) {
        const idAsString = product.id.toString();
        await this.productSizeRepository.create(idAsString, sizeId);
      }
    }
    if (productCategories) {
      for (const categoryId of productCategories) {
        const idAsString = product.id.toString();
        await this.productCategoryRepository.create(idAsString, categoryId);
      }
    }

    return right({
      product,
    });
  }
}
