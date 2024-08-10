import { Either } from "@/core/either";
import { Product } from "../../enterprise/entities/product";
import { ProductWithVariants } from "../../enterprise/entities/productWithVariants";
import { ResourceNotFoundError } from "../use-cases/errors/resource-not-found-error";
import { ProductVariant } from "../../enterprise/entities/product-variant";

export abstract class IProductRepository {
    abstract create(product: Product): Promise<Either<Error, void>>;
    abstract findByColorId(colorId: string): Promise<Either<Error, Product[]>>;
    abstract delete(product: Product): Promise<void>;
    abstract findByName(name: string): Promise<Either<Error, Product[]>>;
    abstract findById(
        productId: string
    ): Promise<Either<Error, ProductWithVariants>>;
    abstract findByCategoryId(
        categoryId: string
    ): Promise<Either<Error, Product[]>>;
    abstract findByBrandId(brandId: string): Promise<Either<Error, Product[]>>;

    abstract findByPriceRange(
        minPrice: number,
        maxPrice: number
    ): Promise<Either<Error, Product[]>>;

    abstract findBySizeId(colorId: string): Promise<Either<Error, Product[]>>;
    abstract findBySlug(slug: string): Promise<
        Either<
            Error,
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
        >
    >;
    abstract save(
        productWithVariants: ProductWithVariants
    ): Promise<Either<ResourceNotFoundError, void>>;
}
