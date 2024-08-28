import { Injectable } from "@nestjs/common";

import { Either, left, right } from "@/core/either";

import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { IProductRepository } from "@/domain/catalog/application/repositories/i-product-repository";
import { Product } from "@/domain/catalog/enterprise/entities/product";
import { Slug } from "@/domain/catalog/enterprise/entities/value-objects/slug";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { ProductWithVariants } from "@/domain/catalog/enterprise/entities/productWithVariants";

@Injectable()
export class InMemoryProductRepository implements IProductRepository {
    findByColorId(colorId: string): Promise<Either<Error, Product[]>> {
      throw new Error("Method not implemented.");
    }
    findByName(name: string): Promise<Either<Error, Product[]>> {
      throw new Error("Method not implemented.");
    }
    findByCategoryId(categoryId: string): Promise<Either<Error, Product[]>> {
      throw new Error("Method not implemented.");
    }
    findByBrandId(brandId: string): Promise<Either<Error, Product[]>> {
      throw new Error("Method not implemented.");
    }
    findByPriceRange(minPrice: number, maxPrice: number): Promise<Either<Error, Product[]>> {
      throw new Error("Method not implemented.");
    }
    findBySizeId(colorId: string): Promise<Either<Error, Product[]>> {
      throw new Error("Method not implemented.");
    }
    private items: ProductWithVariants[] = [];
    private item: Product[] = [];
    products: any;

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
                    item.product.slug.value === slug &&
                    item.product.id.toString() !== productId
            );

            if (existingProduct) {
                count++;
                slug = `${baseSlug}-${count}`;
            }
        } while (existingProduct);

        return slug;
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
        const product = this.products.find((p) => p.slug === slug);

        if (!product) {
            return left(new ResourceNotFoundError("Product not found"));
        }

        const brandName = this.getBrandNameByProductId(
            product.brandId.toString()
        );
        const colors = this.getProductColorsByProductId(product.id.toString());
        const sizes = this.getProductSizesByProductId(product.id.toString());
        const categories = this.getProductCategoriesByProductId(
            product.id.toString()
        );
        const variants = this.getProductVariantsByProductId(
            product.id.toString()
        );

        return right({
            product,
            brandName,
            colors,
            sizes,
            categories,
            variants,
        });
    }

    private getBrandNameByProductId(productId: string): string | undefined {
        // Implementação fictícia, substitua pela lógica real
        return "Example Brand";
    }

    private getProductColorsByProductId(
        productId: string
    ): { id: string; name: string; hex: string }[] {
        // Implementação fictícia, substitua pela lógica real
        return [];
    }

    private getProductSizesByProductId(
        productId: string
    ): { id: string; name: string }[] {
        // Implementação fictícia, substitua pela lógica real
        return [];
    }

    private getProductCategoriesByProductId(
        productId: string
    ): { id: string; name: string }[] {
        // Implementação fictícia, substitua pela lógica real
        return [];
    }

    private getProductVariantsByProductId(productId: string): {
        id: string;
        sizeId?: string;
        colorId?: string;
        stock: number;
        price: number;
        images: string[];
        sku: string;
    }[] {
        // Implementação fictícia, substitua pela lógica real
        return [];
    }

    async save(
        productWithVariants: ProductWithVariants
    ): Promise<Either<Error, void>> {
        const index = this.items.findIndex(
            (item) =>
                item.product.id.toString() ===
                productWithVariants.product.id.toString()
        );

        const baseSlug = productWithVariants.product.slug.value;

        const uniqueSlug = await this.generateUniqueSlug(
            baseSlug,
            productWithVariants.product.id.toString()
        );

        productWithVariants.product.slug.value = uniqueSlug;

        if (index === -1) {
            this.items.push(productWithVariants);
        } else {
            this.items[index] = productWithVariants;
        }

        return right(undefined);
    }

    async findById(
        productId: string
    ): Promise<Either<Error, ProductWithVariants>> {
        const productWithVariants = this.items.find(
            (item) => item.product.id.toString() === productId
        );
        if (!productWithVariants) {
            return left(new Error("Product not found"));
        }
        return right(productWithVariants);
    }

    async create(product: Product): Promise<Either<Error, void>> {
        const existingProduct = this.items.find(
            (item) => item.product.id.toString() === product.id.toString()
        );
        if (existingProduct) {
            return left(new Error("Product already exists"));
        }

        // Cria o ProductWithVariants com o produto simples, sem variantes inicialmente
        const productWithVariants: ProductWithVariants =
            ProductWithVariants.create({
                product: product,
                variants: [], // Variants será adicionado posteriormente
            });

        this.items.push(productWithVariants);
        return right(undefined);
    }

    async delete(product: Product): Promise<void> {
        this.items = this.items.filter(
            (item) => item.id.toString() !== product.id.toString()
        );
    }
}
