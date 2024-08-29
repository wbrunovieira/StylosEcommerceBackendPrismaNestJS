import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";

import { IProductRepository } from "@/domain/catalog/application/repositories/i-product-repository";
import { Product } from "@/domain/catalog/enterprise/entities/product";

import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { IProductVariantRepository } from "@/domain/catalog/application/repositories/i-product-variant-repository";
import { ProductWithVariants } from "@/domain/catalog/enterprise/entities/productWithVariants";
import { Entity } from "@/core/entities/entity";

@Injectable()
export class InMemoryProductRepository implements IProductRepository {
    variantRepository: IProductVariantRepository;
    items: Product[] = [];

    constructor(variantRepository: IProductVariantRepository) {
        this.variantRepository = variantRepository;
        this.items = [];
    }
    private async generateUniqueSlug(
        baseSlug: string,
        productId?: string
    ): Promise<string> {
        let slug = baseSlug;
        let count = 0;
        let existingProduct;

        do {
            existingProduct = this.items.find(
                (item) =>
                    item.slug.value === slug && item.id.toString() !== productId
            );

            if (existingProduct) {
                count++;
                slug = `${baseSlug}-${count}`;
            }
        } while (existingProduct);

        return slug;
    }

    async create(product: Product): Promise<Either<Error, Product>> {
        console.log("async create inmemory repo product bateu");
        const existingProduct = this.items.find(
            (item) => item.id.toString() === product.id.toString()
        );
        if (existingProduct) {
            return left(new Error("Product already exists"));
        }
        console.log("async create inmemory repo product", product);

        this.items.push(product);
        console.log("async create inmemory repo this.items", this.items);
        return right(product);
    }

    async findByColorId(colorId: string): Promise<Either<Error, Product[]>> {
        const products = this.items.filter(
            (product) => product.productColors.toString() === colorId
        );

        if (!products.length) {
            return left(new Error("Products not found for the given color id"));
        }

        return right(products);
    }

    async findByCategoryId(
        categoryId: string
    ): Promise<Either<Error, Product[]>> {
        const products = this.items.filter(
            (product) =>
                product.productCategories &&
                product.productCategories.some(
                    (category) => category.id.toString() === categoryId
                )
        );

        if (!products.length) {
            return left(
                new Error("Products not found for the given category id")
            );
        }

        return right(products);
    }

    async findByBrandId(brandId: string): Promise<Either<Error, Product[]>> {
        const products = this.items.filter(
            (product) => product.brandId.toString() === brandId
        );

        if (!products.length) {
            return left(new Error("Products not found for the given brand id"));
        }

        return right(products);
    }

    async findByPriceRange(
        minPrice: number,
        maxPrice: number
    ): Promise<Either<Error, Product[]>> {
        const products = this.items.filter(
            (product) => product.price >= minPrice && product.price <= maxPrice
        );

        if (!products.length) {
            return left(
                new Error("Products not found for the given price range")
            );
        }

        return right(products);
    }

    async findBySizeId(sizeId: string): Promise<Either<Error, Product[]>> {
        const products = this.items.filter(
            (product) =>
                product.productSizes &&
                product.productSizes.some(
                    (size) => size.id.toString() === sizeId
                )
        );

        if (!products.length) {
            return left(new Error("Products not found for the given size id"));
        }

        return right(products);
    }

    async findByName(name: string): Promise<Either<Error, Product[]>> {
        const products = this.items.filter(
            (product) => product.name.toString() === name
        );

        if (!products.length) {
            return left(new Error("Products not found with the given name"));
        }

        return right(products);
    }

    async findById(productId: string): Promise<Either<Error, Product>> {
        const product = this.items.find(
            (product) => product.id.toString() === productId
        );

        if (!product) {
            return left(new Error("Product not found"));
        }
        return right(product);
    }

    async findBySlug(slug: string): Promise<
        Either<
            Error,
            {
                product: Product;
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
    > {
        const product = this.items.find((item) => item.slug.value === slug);

        if (!product) {
            return left(new ResourceNotFoundError("Product not found"));
        }

        const brandName = this.getBrandNameByProductId(
            product.brandId.toString()
        );

        const colors = (product.productColors ?? []).map((color) => ({
            id: color.id.toString(),
            name: color.name,
            hex: color.hex,
        }));
        const sizes = (product.productSizes ?? []).map((size) => ({
            id: size.id.toString(),
            name: size.name,
        }));
        const categories = (product.productCategories ?? []).map(
            (category) => ({
                id: category.id.toString(),
                name: category.name,
            })
        );
        const productIdVariant = product.productIdVariant;
        if (productIdVariant) {
            const variantsResult =
                await this.variantRepository.findByProductId(productIdVariant);

            if (variantsResult.isRight()) {
                const variants = variantsResult.value;

                return right({
                    product,
                    brandName,
                    colors,
                    sizes,
                    categories,
                    variants: variants.map((variant) => ({
                        id: variant.id.toString(),
                        sizeId: variant.sizeId?.toString(),
                        colorId: variant.colorId?.toString(),
                        stock: variant.stock,
                        price: variant.price,
                        images: variant.images,
                        sku: variant.sku,
                    })),
                });
            } else {
                // Handle the case where fetching variants results in an error
                return left(
                    new Error(
                        "Variants not found for the given product variant ID"
                    )
                );
            }
        } else {
            return left(new Error("Product variant ID is undefined"));
        }
    }

    async save(
        productWithVariants: ProductWithVariants
    ): Promise<Either<ResourceNotFoundError, void>> {
        const index = this.items.findIndex(
            (item) =>
                item.id.toString() === productWithVariants.product.id.toString()
        );

        if (index === -1) {
            return left(new ResourceNotFoundError("Product not found"));
        }

        const baseSlug = productWithVariants.product.slug.value;
        const uniqueSlug = await this.generateUniqueSlug(
            baseSlug,
            productWithVariants.product.id.toString()
        );

        productWithVariants.product.slug.value = uniqueSlug;

        const updatedProduct = Product.create(
            {
                ...productWithVariants.product,
                productVariants: productWithVariants.productVariants || [],
                createdAt: this.items[index].createdAt,
                updatedAt: new Date(),
                length: productWithVariants.product.length,
                name: productWithVariants.product.name,
                description: productWithVariants.product.description,
                brandId: productWithVariants.product.brandId,
                price: productWithVariants.product.price,
                stock: productWithVariants.product.stock,
                sku: productWithVariants.product.sku || "",
                height: productWithVariants.product.height,
                width: productWithVariants.product.width,
                weight: productWithVariants.product.weight,
                hasVariants: productWithVariants.product.hasVariants,
            },
            productWithVariants.product.id
        );
        this.items[index] = updatedProduct;

        return right(undefined);
    }

    async delete(product: Product): Promise<void> {
        this.items = this.items.filter(
            (item) => item.id.toString() !== product.id.toString()
        );
    }

    private getBrandNameByProductId(productId: string): string | undefined {
        // Implementação fictícia, substitua pela lógica real
        return "Example Brand";
    }
}
