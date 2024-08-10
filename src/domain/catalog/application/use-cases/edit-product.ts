import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { Injectable } from "@nestjs/common";
import { IProductRepository } from "../repositories/i-product-repository";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { generateSlug } from "../utils/generate-slug";
import { IBrandRepository } from "../repositories/i-brand-repository";
import { ProductWithVariants } from "../../enterprise/entities/productWithVariants";

interface EditProductUseCaseRequest {
  productId: string;
  name?: string;
  description?: string;
  productSizes?: { id: string; name: string }[];
  productColors?: { id: string; name: string; hex: string }[];
  productCategories?: { id: string; name: string }[];

  sizeId?: string[];
  finalPrice?: number;
  brandId?: string;
  discount?: number;
  price?: number;
  stock?: number;
  sku?: string;
  erpId?: string;
  height?: number;
  width?: number;
  length?: number;
  weight?: number;
  onSale?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  images?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

type EditProductUseCaseResponse = Either<
  ResourceNotFoundError,
  ProductWithVariants
>;

@Injectable()
export class EditProductUseCase {
  constructor(
    private productRepository: IProductRepository,
    private brandRepository: IBrandRepository
  ) {}

  private calculateFinalPrice(price: number, discount?: number): number {
    if (discount && discount > 0) {
      return price - price * (discount / 100);
    }
    return price;
  }

  async execute({
    productId,
    name,
    description,
    productSizes,
    productColors,
    productCategories,

    sizeId,
    erpId,
    brandId,
    discount,
    price,
    stock,
    sku,
    height,
    width,
    length,
    weight,
    onSale,
    isFeatured,
    isNew,
    images,
  }: EditProductUseCaseRequest): Promise<EditProductUseCaseResponse> {
    const productResult = await this.productRepository.findById(productId);

    if (productResult.isLeft()) {
      return left(new ResourceNotFoundError("Product not found"));
    }

    const productWithVariants = productResult.value;
    const product = productWithVariants.product;
    let priceChanged = false;
    let discountChanged = false;
    let nameChanged = false;

    if (name !== undefined && name !== product.name) {
      product.name = name;
      nameChanged = true;
    }
    if (description !== undefined) product.description = description;

    if (productSizes !== undefined)
      product.productSizes = productSizes.map((size) => ({
        id: new UniqueEntityID(size.id),
        name: size.name,
      }));

    if (productCategories !== undefined)
      product.productCategories = productCategories.map((category) => ({
        id: new UniqueEntityID(category.id),
        name: category.name,
      }));
    if (productColors !== undefined)
      product.productColors = productColors.map((color) => ({
        id: new UniqueEntityID(color.id),
        name: color.name,
        hex: color.hex,
      }));

    if (sizeId !== undefined)
      product.sizeId = sizeId.map((id) => new UniqueEntityID(id));
    if (brandId !== undefined) product.brandId = new UniqueEntityID(brandId);
    if (discount !== undefined) {
      product.discount = discount;
      discountChanged = true;
    }
    if (price !== undefined) {
      product.price = price;
      priceChanged = true;
    }
    if (stock !== undefined) product.stock = stock;
    if (erpId !== undefined) product.erpId = erpId;
    if (sku !== undefined) product.sku = sku;
    if (height !== undefined) product.height = height;
    if (width !== undefined) product.width = width;
    if (length !== undefined) product.length = length;
    if (weight !== undefined) product.weight = weight;
    if (onSale !== undefined) product.onSale = onSale;
    if (isFeatured !== undefined) product.isFeatured = isFeatured;
    if (isNew !== undefined) product.isNew = isNew;
    if (images !== undefined) product.images = images;

    if (priceChanged || discountChanged) {
      const finalPrice = this.calculateFinalPrice(
        product.price,
        product.discount
      );

      product.setFinalPrice(finalPrice);
    }

    const brandOrError = await this.brandRepository.findById(
      product.brandId.toString()
    );
    if (brandOrError.isLeft()) {
      return left(new ResourceNotFoundError("Brand not found"));
    }

    const brand = brandOrError.value;
    let newSlug;

    if (nameChanged) {
      newSlug = generateSlug(product.name, brand.name, product.id.toString());
      product.slug = newSlug;
    }

    const saveResult = await this.productRepository.save(productWithVariants);

    if (saveResult.isLeft()) {
      return left(new ResourceNotFoundError("Failed to update product"));
    }

    return right(productWithVariants);
  }
}
