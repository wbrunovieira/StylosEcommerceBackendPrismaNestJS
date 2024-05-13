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
import { Injectable } from "@nestjs/common";
import { IColorRepository } from "../repositories/i-color-repository";

interface CreateProductUseCaseRequest {
  name: string;
  description: string;
  productColors?: string[];
  productSizes?: string[];
  productCategories?: string[];
  materialId?: string | null;
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

@Injectable()
export class CreateProductUseCase {
  constructor(
    private productRepository: IProductRepository,
    private productColorRepository: IProductColorRepository,
    private productSizeRepository: IProductSizeRepository,
    private productCategoryRepository: IProductCategoryRepository,
    private colorRepository: IColorRepository,
    private brandRepository: IBrandRepository,
    private materialRepository: IMaterialRepository
  ) {}

  async execute({
    name,
    description,
    productColors,
    productSizes,
    productCategories,
    materialId = null,
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

    if (materialId) {
      const materialResult = await this.materialRepository.findById(materialId);
      if (materialResult.isLeft()) {
        return left(new ResourceNotFoundError("Material not found"));
      }
    }

    if (productColors) {
      console.log(
        "chamou o productcolor no usecase create product",
        productColors
      );

      for (const colorId of productColors) {
        console.log("no log do for no create product usecase", colorId);
        const colorExists = await this.colorRepository.findById(colorId);
        if (colorExists.isLeft()) {
          return left(new ResourceNotFoundError(`Color not found: ${colorId}`));
        }
      }
    }

    const product = Product.create({
      name,
      description,
      materialId: materialId ? new UniqueEntityID(materialId) : undefined,
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

    if (productColors) {
      console.log(
        "chamou o productcolor no usecase create product",
        productColors
      );
      for (const colorId of productColors) {
        console.log("no log do for no create product usecase", colorId);
        const idAsString = product.id.toString();
        console.log(
          "no log do for quase no repo productid e colorid",
          idAsString,
          colorId
        );
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

    await this.productRepository.create(product);

    return right({
      product,
    });
  }
}
