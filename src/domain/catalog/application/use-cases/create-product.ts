import { Either, left, right } from "@/core/either";
import { Product } from "../../enterprise/entities/product";

import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import { ResourceNotFoundError } from "./errors/resource-not-found-error";

import { IProductRepository } from "../repositories/i-product-repository";

import { IBrandRepository } from "../repositories/i-brand-repository";
import { IMaterialRepository } from "../repositories/i-material-repository";
import { Injectable } from "@nestjs/common";

import { Material } from "../../enterprise/entities/material";
import { ISizeRepository } from "../repositories/i-size-repository";
import { IProductSizeRepository } from "../repositories/i-product-size-repository";
import { IColorRepository } from "../repositories/i-color-repository";
import { IProductColorRepository } from "../repositories/i-product-color-repository";

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
    private colorRepository: IColorRepository,
    private brandRepository: IBrandRepository,
    private materialRepository: IMaterialRepository,
    private sizeRepository: ISizeRepository,
    private productSizeRepository: IProductSizeRepository,
    private productColorRepository: IProductColorRepository
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

    if (price < 0) {
      return left(new ResourceNotFoundError("Price cannot be negative"));
    }

    const brandOrError = await this.brandRepository.findById(brandId);
    if (brandOrError.isLeft()) {
      return left(new ResourceNotFoundError("Brand not found"));
    }

    let materialOrError: Either<Error, Material | null> = right(null);
    if (materialId) {
      materialOrError = await this.materialRepository.findById(materialId);
      if (materialOrError.isLeft()) {
        return left(new ResourceNotFoundError("Material not found"));
      }
    }

    const material = materialOrError.isRight() ? materialOrError.value : null;

    console.log("sizes no sizes repo", productSizes);

    if (productSizes) {
      const uniqueSizes = new Set<string>();

      for (const sizeId of productSizes) {
        if (!sizeId) {
          return left(new Error("InvalidSizeError"));
        }

        if (uniqueSizes.has(sizeId)) {
          return left(new ResourceNotFoundError(`Duplicate size: ${sizeId}`));
        }
        uniqueSizes.add(sizeId);
        const sizeExists = await this.sizeRepository.findById(sizeId);
        if (sizeExists.isLeft()) {
          return left(new ResourceNotFoundError(`Size not found: ${sizeId}`));
        }
      }
    }

    if (productColors) {
      const uniqueColors = new Set<string>();

      for (const colorId of productColors) {
        if (!colorId) {
          return left(new Error("InvalidColorError"));
        }

        if (uniqueColors.has(colorId)) {
          return left(new ResourceNotFoundError(`Duplicate color: ${colorId}`));
        }
        uniqueColors.add(colorId);
        const sizeExists = await this.colorRepository.findById(colorId);
        if (sizeExists.isLeft()) {
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
    await this.productRepository.create(product);

    if (productSizes) {
      const uniqueSizes = new Set();
      console.log("productSize no useCase", productSizes);
      for (const sizeId of productSizes) {
        await this.productSizeRepository.create(product.id.toString(), sizeId);
      }
    }

    if (productColors) {
      const uniqueColor = new Set();

      for (const colorId of productColors) {
        await this.productColorRepository.create(
          product.id.toString(),
          colorId
        );
      }
    }

    return right({
      product,
    });
  }
}
