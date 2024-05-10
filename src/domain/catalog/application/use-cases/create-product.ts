import { Either, left, right } from "@/core/either";
import { Product } from "../../enterprise/entities/product";

import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import { ResourceNotFoundError } from "./errors/resource-not-found-error";

import { PrismaProductCategoryRepository } from "../repositories/prisma-product-category-repository";
import { PrismaProductSizeRepository } from "../repositories/prisma-product-size-repository";
import { PrismaProductColorRepository } from "../repositories/prisma-product-color-repository";
import { PrismaMaterialRepository } from "../repositories/prisma-material-repository";
import { PrismaBrandRepository } from "../repositories/prisma-brand-repository";
import { PrismaProductRepository } from "../repositories/prisma-product-repository";

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
    private productRepository: PrismaProductRepository,
    private productColorRepository: PrismaProductColorRepository,
    private productSizeRepository: PrismaProductSizeRepository,
    private productCategoryRepository: PrismaProductCategoryRepository,

    private brandRepository: PrismaBrandRepository,
    private materialRepository: PrismaMaterialRepository
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
    console.log("úse case do create product entrou");
    console.log("brandid", brandId);
    const brand = await this.brandRepository.findById(brandId);
    console.log("entro na brand do produto", brand);
    if (!brand) {
      return left(new ResourceNotFoundError());
    }
    console.log("brand do product", brand);

    if (materialId) {
      const material = await this.materialRepository.findById(materialId);
      if (!material) {
        return left(new ResourceNotFoundError());
      }
    }
    console.log("material do produto", materialId);

    const product = Product.create({
      name,
      description,
      materialId: new UniqueEntityID(materialId),
      brandID: new UniqueEntityID(brandId),
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
    console.log(" quase produto criado", product);

    await this.productRepository.create(product);
    console.log(" produto criado", product);

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
