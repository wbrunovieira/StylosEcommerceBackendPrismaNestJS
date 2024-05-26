import { Either, left, right } from "@/core/either";
import { Product } from "../../enterprise/entities/product";

import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import { ResourceNotFoundError } from "./errors/resource-not-found-error";

import { IProductRepository } from "../repositories/i-product-repository";

import { IBrandRepository } from "../repositories/i-brand-repository";
import { IMaterialRepository } from "../repositories/i-material-repository";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";

import { Material } from "../../enterprise/entities/material";
import { ISizeRepository } from "../repositories/i-size-repository";
import { IProductSizeRepository } from "../repositories/i-product-size-repository";
import { IColorRepository } from "../repositories/i-color-repository";
import { IProductColorRepository } from "../repositories/i-product-color-repository";
import { ICategoryRepository } from "../repositories/i-category-repository";
import { IProductCategoryRepository } from "../repositories/i-product-category-repository";
import { IProductVariantRepository } from "../repositories/i-product-variant-repository";
import { ProductVariant } from "../../enterprise/entities/product-variant";
import { ProductStatus } from "../../enterprise/entities/product-status";
import { PrismaService } from "@/prisma/prisma.service";
import { generateSlug } from "../utils/generate-slug";

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
  ResourceNotFoundError | null,
  {
    product: Product;
  }
>;

@Injectable()
export class CreateProductUseCase {
  constructor(
    private productRepository: IProductRepository,
  
    // private colorRepository: IColorRepository,
    // private brandRepository: IBrandRepository,
    // private materialRepository: IMaterialRepository,
    // private sizeRepository: ISizeRepository,
    // private categoryRepository: ICategoryRepository,
    // private productSizeRepository: IProductSizeRepository,
    // private productColorRepository: IProductColorRepository,
    // private productCategoryRepository: IProductCategoryRepository,
    // private productVariantRepository: IProductVariantRepository
  ) {}

  async execute({
    name,
    description,
    // productColors,
    // productSizes,
    // productCategories,
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
    // const brandOrError = await this.brandRepository.findById(brandId);
    // if (brandOrError.isLeft()) {
    //   return left(new ResourceNotFoundError("Brand not found"));
    // }

    // let materialOrError: Either<Error, Material | null> = right(null);
    // if (materialId) {
    //   materialOrError = await this.materialRepository.findById(materialId);
    //   if (materialOrError.isLeft()) {
    //     return left(new ResourceNotFoundError("Material not found"));
    //   }
    // }

    // const material = materialOrError.isRight() ? materialOrError.value : null;

    // if (productSizes) {
    //   const uniqueSizes = new Set<string>();

    //   for (const sizeId of productSizes) {
    //     if (!sizeId) {
    //       return left(new Error("InvalidSizeError"));
    //     }

    //     if (uniqueSizes.has(sizeId)) {
    //       return left(new ResourceNotFoundError(`Duplicate size: ${sizeId}`));
    //     }
    //     uniqueSizes.add(sizeId);
    //     const sizeExists = await this.sizeRepository.findById(sizeId);
    //     if (sizeExists.isLeft()) {
    //       return left(new ResourceNotFoundError(`Size not found: ${sizeId}`));
    //     }
    //   }
    // }

    // if (productColors) {
    //   const uniqueColors = new Set<string>();

    //   for (const colorId of productColors) {
    //     if (!colorId) {
    //       return left(new Error("InvalidColorError"));
    //     }

    //     if (uniqueColors.has(colorId)) {
    //       return left(new ResourceNotFoundError(`Duplicate color: ${colorId}`));
    //     }
    //     uniqueColors.add(colorId);

    //     const colorExists = await this.colorRepository.findById(colorId);

    //     if (colorExists.isLeft()) {
    //       return left(new ResourceNotFoundError(`Color not found: ${colorId}`));
    //     }
    //   }
    // }

    // if (productCategories) {
    //   const uniqueCategory = new Set<string>();

    //   for (const categoryId of productCategories) {
    //     if (!categoryId) {
    //       return left(new Error("InvalidCategoryError"));
    //     }

    //     if (uniqueCategory.has(categoryId)) {
    //       return left(
    //         new ResourceNotFoundError(`Duplicate category: ${categoryId}`)
    //       );
    //     }
    //     uniqueCategory.add(categoryId);

    //     const categoryExists =
    //       await this.categoryRepository.findById(categoryId);

    //     if (categoryExists.isLeft()) {
    //       return left(
    //         new ResourceNotFoundError(`Category not found: ${categoryId}`)
    //       );
    //     }
    //   }
    // }

    try {
      if (!name.trim()) {
        return left(new ResourceNotFoundError("Product name is required"));
      }

      if (stock < 0) {
        return left(new ResourceNotFoundError("Stock cannot be negative"));
      }

      if (price < 0) {
        return left(new ResourceNotFoundError("Price cannot be negative"));
      }
      
      const slug = generateSlug(name, "brand-name");

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
        slug,
      });

      console.log("product use case ", product);
      const result = await this.productRepository.create(product);
      console.log("result use case ", result);

      return right({
        product,
      });
    } catch (error) {
      console.error("Error creating product:", error);
      return left(error as Error);
    }

    // const variants: ProductVariant[] = [];

    // if (productSizes && productColors) {
    //   for (const sizeId of productSizes) {
    //     for (const colorId of productColors) {
    //       variants.push(
    //         ProductVariant.create({
    //           productId: product.id,
    //           sizeId: new UniqueEntityID(sizeId),
    //           colorId: new UniqueEntityID(colorId),
    //           stock,
    //           price,
    //           status: ProductStatus.ACTIVE,
    //           images,
    //         })
    //       );
    //     }
    //   }
    // }

    // if (productSizes && (!productColors || productColors.length === 0)) {
    //   for (const sizeId of productSizes) {
    //     variants.push(
    //       ProductVariant.create({
    //         productId: product.id,
    //         sizeId: new UniqueEntityID(sizeId),
    //         stock,
    //         price,
    //         status: ProductStatus.ACTIVE,
    //         images,
    //       })
    //     );
    //   }
    // }

    // if (productColors && (!productSizes || productSizes.length === 0)) {
    //   for (const colorId of productColors) {
    //     variants.push(
    //       ProductVariant.create({
    //         productId: product.id,
    //         colorId: new UniqueEntityID(colorId),
    //         stock,
    //         price,
    //         status: ProductStatus.ACTIVE,
    //         images,
    //       })
    //     );
    //   }
    // }

    // if (
    //   (!productSizes || productSizes.length === 0) &&
    //   (!productColors || productColors.length === 0)
    // ) {
    //   variants.push(
    //     ProductVariant.create({
    //       productId: product.id,
    //       stock,
    //       price,
    //       status: ProductStatus.ACTIVE,
    //       images,
    //     })
    //   );
    // }

    // for (const variant of variants) {
    //   await this.productVariantRepository.create(variant);
    // }

    // if (productSizes) {
    //   const uniqueSizes = new Set();

    //   for (const sizeId of productSizes) {
    //     await this.productSizeRepository.create(product.id.toString(), sizeId);
    //   }
    // }

    // if (productColors) {
    //   for (const colorId of productColors) {
    //     await this.productColorRepository.create(
    //       product.id.toString(),
    //       colorId
    //     );
    //   }
    // }

    // if (productCategories) {
    //   for (const categoryId of productCategories) {
    //     await this.productCategoryRepository.create(
    //       product.id.toString(),
    //       categoryId
    //     );
    //   }
    // }
  }
}
