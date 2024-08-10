import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../prisma/prisma.service";
import { IProductRepository } from "../../../../domain/catalog/application/repositories/i-product-repository";
import { Product } from "../../../../domain/catalog/enterprise/entities/product";

import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Slug } from "@/domain/catalog/enterprise/entities/value-objects/slug";
import { ProductWithVariants } from "@/domain/catalog/enterprise/entities/productWithVariants";
import { ProductVariant } from "@/domain/catalog/enterprise/entities/product-variant";
import { ProductStatus as PrismaProductStatus } from "@prisma/client";
import { toDomainProductStatus } from "../utils/convert-product-status";

@Injectable()
export class PrismaProductRepository implements IProductRepository {
    constructor(private prisma: PrismaService) {}

    async create(product: Product): Promise<Either<Error, void>> {
        try {
            const {
                productColors,
                productSizes,
                productCategories,
                name,
                description,
                price,
                stock,
                materialId,
                brandId,
                erpId,
                images,
                createdAt,
                updatedAt,
                slug,
                finalPrice,
                ...otherProps
            } = {
                productColors: product.productColors,
                productSizes: product.productSizes,
                productCategories: product.productCategories,
                name: product.name,
                description: product.description,
                price: product.price,
                stock: product.stock,
                erpId: product.erpId,
                materialId: product.materialId
                    ? product.materialId.toString()
                    : null,
                brandId: product.brandId.toString(),
                images: product.images,
                createdAt: product.createdAt,
                updatedAt: product.updatedAt,
                slug: product.slug.toString(),
                finalPrice: product.finalPrice,
            };

            const validColors: { id: string }[] = [];
            const validSizes: { id: string }[] = [];
            const validCategories: { id: string }[] = [];

            if (productColors) {
                for (const colorId of productColors) {
                    const idAsString = colorId.toString();
                    const colorExists = await this.prisma.color.findUnique({
                        where: { id: idAsString },
                    });
                    if (colorExists) {
                        validColors.push({ id: idAsString });
                    }
                }
            }

            if (productSizes) {
                for (const sizeId of productSizes) {
                    const idAsString = sizeId.toString();
                    const sizeExist = await this.prisma.size.findUnique({
                        where: { id: idAsString },
                    });
                    if (sizeExist) {
                        validSizes.push({ id: idAsString });
                    }
                }
            }
            if (productCategories) {
                for (const categoryId of productCategories) {
                    const idAsString = categoryId.toString();
                    const categoryExist = await this.prisma.category.findUnique(
                        {
                            where: { id: idAsString },
                        }
                    );
                    if (categoryExist) {
                        validCategories.push({ id: idAsString });
                    }
                }
            }

            let materialExist;
            if (materialId) {
                const materialIDAsString = materialId.toString();
                materialExist = await this.prisma.material.findUnique({
                    where: { id: materialIDAsString },
                });
                if (!materialExist) {
                    throw new Error("Material not found.");
                }
            }

            let brandExist;
            if (brandId) {
                const brandIDAsString = brandId.toString();

                brandExist = await this.prisma.brand.findUnique({
                    where: { id: brandIDAsString },
                    select: { id: true, name: true },
                });
                if (!brandExist) {
                    throw new Error("Brand not found.");
                }
            }

            if (!brandExist || !brandExist.id) {
                throw new Error("Brand ID is not valid");
            }

            const createdProduct = await this.prisma.product.create({
                data: {
                    id: product.id.toString(),
                    name: name,
                    images: images,
                    description: description,
                    createdAt: createdAt,
                    updatedAt: updatedAt,
                    slug: slug,
                    price: price,
                    stock: stock,
                    erpId: erpId,
                    height: product.height,
                    width: product.width,
                    length: product.length,
                    weight: product.weight,
                    material: materialExist
                        ? { connect: { id: materialExist.id } }
                        : undefined,
                    brand: { connect: { id: brandExist.id } },
                    finalPrice: finalPrice ?? undefined,
                    ...otherProps,
                },
            });

            return right(undefined);
        } catch (error) {
            return left(new Error("Failed to create material"));
        }
    }

    async findByMaterialId(
        materialId: string
    ): Promise<Either<Error, Product[]>> {
        try {
        
            const productsData = await this.prisma.product.findMany({
                where: {
                    materialId: materialId,
                },
                include: {
                    productColors: {
                        include: {
                            color: true,
                        },
                    },
                    productSizes: {
                        include: {
                            size: true,
                        },
                    },
                    productCategories: {
                        include: {
                            category: true,
                        },
                    },
                    brand: true,
                    material: true,
                    productVariants: true,
                },
            });

            if (!productsData.length) {
                return left(
                    new ResourceNotFoundError(
                        `No products found for materialId: ${materialId}`
                    )
                );
            }

            const products = productsData.map((productData) =>
                Product.create(
                    {
                        name: productData.name,
                        description: productData.description,
                        productSizes: productData.productSizes.map((size) => ({
                            id: new UniqueEntityID(size.sizeId),
                            name: size.size.name,
                        })),
                        productColors: productData.productColors.map(
                            (color) => ({
                                id: new UniqueEntityID(color.colorId),
                                name: color.color.name,
                                hex: color.color.hex,
                            })
                        ),
                        productCategories: productData.productCategories.map(
                            (category) => ({
                                id: new UniqueEntityID(category.categoryId),
                                name: category.category.name,
                            })
                        ),
                        materialId: productData.materialId
                            ? new UniqueEntityID(productData.materialId)
                            : undefined,
                        sizeId: productData.productSizes.map(
                            (size) => new UniqueEntityID(size.sizeId)
                        ),
                        finalPrice: productData.finalPrice ?? undefined,
                        brandId: new UniqueEntityID(productData.brandId),
                        brandName: productData.brand?.name ?? "Unknown Brand",
                        materialName:
                            productData.material?.name ?? "Unknown Material",
                        brandUrl:
                            productData.brand?.imageUrl ??
                            "Unknown Brand image",
                        discount: productData.discount ?? undefined,
                        price: productData.price,
                        stock: productData.stock,
                        sku: productData.sku ?? "ntt",
                        height: productData.height ?? undefined,
                        width: productData.width ?? undefined,
                        length: productData.length ?? undefined,
                        weight: productData.weight ?? undefined,
                        onSale: productData.onSale ?? undefined,
                        isFeatured: productData.isFeatured ?? undefined,
                        hasVariants: productData.hasVariants ?? undefined,
                        isNew: productData.isNew ?? undefined,
                        images: productData.images ?? undefined,
                        slug: Slug.createFromText(productData.slug),
                        createdAt: new Date(productData.createdAt),
                        updatedAt: productData.updatedAt
                            ? new Date(productData.updatedAt)
                            : undefined,
                    },
                    new UniqueEntityID(productData.id)
                )
            );

            return right(products);
        } catch (error) {
            console.error(
                `Failed to retrieve products for materialId: ${materialId}, Error: ${error}`
            );
            return left(
                new ResourceNotFoundError(
                    `Failed to retrieve products for materialId: ${materialId}`
                )
            );
        }
    }

    async findByPriceRange(
        minPrice: number,
        maxPrice: number
    ): Promise<Either<Error, Product[]>> {
        try {
          
            const productsData = await this.prisma.product.findMany({
                where: {
                    finalPrice: {
                        gte: minPrice,
                        lte: maxPrice,
                    },
                },
                include: {
                    productColors: {
                        include: {
                            color: true,
                        },
                    },
                    productSizes: {
                        include: {
                            size: true,
                        },
                    },
                    productCategories: {
                        include: {
                            category: true,
                        },
                    },
                    brand: true,
                    material: true,
                    productVariants: true,
                },
            });

            if (!productsData.length) {
                return left(
                    new ResourceNotFoundError(
                        `No products found within price range: ${minPrice} - ${maxPrice}`
                    )
                );
            }

            const products = productsData.map((productData) =>
                Product.create(
                    {
                        name: productData.name,
                        description: productData.description,
                        productSizes: productData.productSizes.map((size) => ({
                            id: new UniqueEntityID(size.sizeId),
                            name: size.size.name,
                        })),
                        productColors: productData.productColors.map(
                            (color) => ({
                                id: new UniqueEntityID(color.colorId),
                                name: color.color.name,
                                hex: color.color.hex,
                            })
                        ),
                        productCategories: productData.productCategories.map(
                            (category) => ({
                                id: new UniqueEntityID(category.categoryId),
                                name: category.category.name,
                            })
                        ),
                        materialId: productData.materialId
                            ? new UniqueEntityID(productData.materialId)
                            : undefined,
                        sizeId: productData.productSizes.map(
                            (size) => new UniqueEntityID(size.sizeId)
                        ),
                        finalPrice: productData.finalPrice ?? undefined,
                        brandId: new UniqueEntityID(productData.brandId),
                        brandName: productData.brand?.name ?? "Unknown Brand",
                        brandUrl:
                            productData.brand?.imageUrl ??
                            "Unknown Brand image",
                        discount: productData.discount ?? undefined,
                        price: productData.price,
                        stock: productData.stock,
                        sku: productData.sku ?? "ntt",
                        height: productData.height ?? undefined,
                        width: productData.width ?? undefined,
                        length: productData.length ?? undefined,
                        weight: productData.weight ?? undefined,
                        onSale: productData.onSale ?? undefined,
                        isFeatured: productData.isFeatured ?? undefined,
                        hasVariants: productData.hasVariants ?? undefined,
                        isNew: productData.isNew ?? undefined,
                        images: productData.images ?? undefined,
                        slug: Slug.createFromText(productData.slug),
                        createdAt: new Date(productData.createdAt),
                        updatedAt: productData.updatedAt
                            ? new Date(productData.updatedAt)
                            : undefined,
                    },
                    new UniqueEntityID(productData.id)
                )
            );

            return right(products);
        } catch (error) {
            console.error(
                `Failed to retrieve products within price range: ${minPrice} - ${maxPrice}, Error: ${error}`
            );
            return left(
                new ResourceNotFoundError(
                    `Failed to retrieve products within price range: ${minPrice} - ${maxPrice}`
                )
            );
        }
    }

    async findBySizeId(sizeId: string): Promise<Either<Error, Product[]>> {
        try {
        
            const productsData = await this.prisma.product.findMany({
                where: {
                    productSizes: {
                        some: {
                            sizeId: sizeId,
                        },
                    },
                },
                include: {
                    productColors: {
                        include: {
                            color: true,
                        },
                    },
                    productSizes: {
                        include: {
                            size: true,
                        },
                    },
                    productCategories: {
                        include: {
                            category: true,
                        },
                    },
                    brand: true,
                    material: true,
                    productVariants: true,
                },
            });

            if (!productsData.length) {
                return left(
                    new ResourceNotFoundError(
                        `No products found for sizeId: ${sizeId}`
                    )
                );
            }

            const products = productsData.map((productData) =>
                Product.create(
                    {
                        name: productData.name,
                        description: productData.description,
                        productSizes: productData.productSizes.map((size) => ({
                            id: new UniqueEntityID(size.sizeId),
                            name: size.size.name,
                        })),
                        productColors: productData.productColors.map(
                            (color) => ({
                                id: new UniqueEntityID(color.colorId),
                                name: color.color.name,
                                hex: color.color.hex,
                            })
                        ),
                        productCategories: productData.productCategories.map(
                            (category) => ({
                                id: new UniqueEntityID(category.categoryId),
                                name: category.category.name,
                            })
                        ),
                        materialId: productData.materialId
                            ? new UniqueEntityID(productData.materialId)
                            : undefined,
                        sizeId: productData.productSizes.map(
                            (size) => new UniqueEntityID(size.sizeId)
                        ),
                        finalPrice: productData.finalPrice ?? undefined,
                        brandId: new UniqueEntityID(productData.brandId),
                        brandName: productData.brand?.name ?? "Unknown Brand",
                        brandUrl:
                            productData.brand?.imageUrl ??
                            "Unknown Brand image",
                        discount: productData.discount ?? undefined,
                        price: productData.price,
                        stock: productData.stock,
                        sku: productData.sku ?? "ntt",
                        height: productData.height ?? undefined,
                        width: productData.width ?? undefined,
                        length: productData.length ?? undefined,
                        weight: productData.weight ?? undefined,
                        onSale: productData.onSale ?? undefined,
                        isFeatured: productData.isFeatured ?? undefined,
                        hasVariants: productData.hasVariants ?? undefined,
                        isNew: productData.isNew ?? undefined,
                        images: productData.images ?? undefined,
                        slug: Slug.createFromText(productData.slug),
                        createdAt: new Date(productData.createdAt),
                        updatedAt: productData.updatedAt
                            ? new Date(productData.updatedAt)
                            : undefined,
                    },
                    new UniqueEntityID(productData.id)
                )
            );

            return right(products);
        } catch (error) {
            console.error(
                `Failed to retrieve products for sizeId: ${sizeId}, Error: ${error}`
            );
            return left(
                new ResourceNotFoundError(
                    `Failed to retrieve products for sizeId: ${sizeId}`
                )
            );
        }
    }

    async findByColorId(colorId: string): Promise<Either<Error, Product[]>> {
        try {
      
            const productsData = await this.prisma.product.findMany({
                where: {
                    productColors: {
                        some: {
                            colorId: colorId,
                        },
                    },
                },
                include: {
                    productColors: {
                        include: {
                            color: true,
                        },
                    },
                    productSizes: {
                        include: {
                            size: true,
                        },
                    },
                    productCategories: {
                        include: {
                            category: true,
                        },
                    },
                    brand: true,
                    material: true,
                    productVariants: true,
                },
            });

            if (!productsData.length) {
                return left(
                    new ResourceNotFoundError(
                        `No products found for colorId: ${colorId}`
                    )
                );
            }

            const products = productsData.map((productData) =>
                Product.create(
                    {
                        name: productData.name,
                        description: productData.description,
                        productSizes: productData.productSizes.map((size) => ({
                            id: new UniqueEntityID(size.sizeId),
                            name: size.size.name,
                        })),

                        productCategories: productData.productCategories.map(
                            (category) => ({
                                id: new UniqueEntityID(category.categoryId),
                                name: category.category.name,
                            })
                        ),
                        productColors: productData.productColors.map(
                            (color) => ({
                                id: new UniqueEntityID(color.colorId),
                                name: color.color.name,
                                hex: color.color.hex,
                            })
                        ),
                        materialId: productData.materialId
                            ? new UniqueEntityID(productData.materialId)
                            : undefined,
                        sizeId: productData.productSizes.map(
                            (size) => new UniqueEntityID(size.sizeId)
                        ),
                        finalPrice: productData.finalPrice ?? undefined,
                        brandId: new UniqueEntityID(productData.brandId),
                        brandName: productData.brand?.name ?? "Unknown Brand",
                        brandUrl:
                            productData.brand?.imageUrl ??
                            "Unknown Brand image",
                        discount: productData.discount ?? undefined,
                        price: productData.price,
                        stock: productData.stock,
                        sku: productData.sku ?? "ntt",
                        height: productData.height ?? undefined,
                        width: productData.width ?? undefined,
                        length: productData.length ?? undefined,
                        weight: productData.weight ?? undefined,
                        onSale: productData.onSale ?? undefined,
                        isFeatured: productData.isFeatured ?? undefined,
                        hasVariants: productData.hasVariants ?? undefined,
                        isNew: productData.isNew ?? undefined,
                        images: productData.images ?? undefined,
                        slug: Slug.createFromText(productData.slug),
                        createdAt: new Date(productData.createdAt),
                        updatedAt: productData.updatedAt
                            ? new Date(productData.updatedAt)
                            : undefined,
                    },
                    new UniqueEntityID(productData.id)
                )
            );

            return right(products);
        } catch (error) {
            console.error(
                `Failed to retrieve products for colorId: ${colorId}, Error: ${error}`
            );
            return left(
                new ResourceNotFoundError(
                    `Failed to retrieve products for colorId: ${colorId}`
                )
            );
        }
    }

    async findByBrandId(brandId: string): Promise<Either<Error, Product[]>> {
        try {
          
            const productsData = await this.prisma.product.findMany({
                where: {
                    brandId: brandId,
                },
                include: {
                    productColors: {
                        include: {
                            color: true,
                        },
                    },
                    productSizes: {
                        include: {
                            size: true,
                        },
                    },
                    productCategories: {
                        include: {
                            category: true,
                        },
                    },
                    brand: true,
                    material: true,
                    productVariants: true,
                },
            });

            if (!productsData.length) {
                return left(
                    new ResourceNotFoundError(
                        `No products found for brandId: ${brandId}`
                    )
                );
            }

            const products = productsData.map((productData) =>
                Product.create(
                    {
                        name: productData.name,
                        description: productData.description,
                        productSizes: productData.productSizes.map((size) => ({
                            id: new UniqueEntityID(size.sizeId),
                            name: size.size.name,
                        })),
                        productColors: productData.productColors.map(
                            (color) => ({
                                id: new UniqueEntityID(color.colorId),
                                name: color.color.name,
                                hex: color.color.hex,
                            })
                        ),
                        productCategories: productData.productCategories.map(
                            (category) => ({
                                id: new UniqueEntityID(category.categoryId),
                                name: category.category.name,
                            })
                        ),
                        materialId: productData.materialId
                            ? new UniqueEntityID(productData.materialId)
                            : undefined,
                        sizeId: productData.productSizes.map(
                            (size) => new UniqueEntityID(size.sizeId)
                        ),
                        finalPrice: productData.finalPrice ?? undefined,
                        brandId: new UniqueEntityID(productData.brandId),
                        brandName: productData.brand?.name ?? "Unknown Brand",
                        brandUrl:
                            productData.brand?.imageUrl ??
                            "Unknown Brand image",
                        discount: productData.discount ?? undefined,
                        price: productData.price,
                        stock: productData.stock,
                        sku: productData.sku ?? "ntt",
                        height: productData.height ?? undefined,
                        width: productData.width ?? undefined,
                        length: productData.length ?? undefined,
                        weight: productData.weight ?? undefined,
                        onSale: productData.onSale ?? undefined,
                        isFeatured: productData.isFeatured ?? undefined,
                        hasVariants: productData.hasVariants ?? undefined,
                        isNew: productData.isNew ?? undefined,
                        images: productData.images ?? undefined,
                        slug: Slug.createFromText(productData.slug),
                        createdAt: new Date(productData.createdAt),
                        updatedAt: productData.updatedAt
                            ? new Date(productData.updatedAt)
                            : undefined,
                    },
                    new UniqueEntityID(productData.id)
                )
            );

            return right(products);
        } catch (error) {
            console.error(
                `Failed to retrieve products for brandId: ${brandId}, Error: ${error}`
            );
            return left(
                new ResourceNotFoundError(
                    `Failed to retrieve products for brandId: ${brandId}`
                )
            );
        }
    }

    async findByName(name: string): Promise<Either<Error, Product[]>> {
        try {
         
            const productsData = await this.prisma.product.findMany({
                where: {
                    name: {
                        contains: name,
                        mode: "insensitive",
                    },
                },
                include: {
                    productColors: {
                        include: {
                            color: true,
                        },
                    },
                    productSizes: {
                        include: {
                            size: true,
                        },
                    },
                    productCategories: {
                        include: {
                            category: true,
                        },
                    },
                    brand: true,
                    material: true,
                    productVariants: true,
                },
            });

            if (!productsData.length) {
                return left(
                    new ResourceNotFoundError(
                        `No products found for name: ${name}`
                    )
                );
            }

            const products = productsData.map((productData) =>
                Product.create(
                    {
                        name: productData.name,
                        description: productData.description,
                        productSizes: productData.productSizes.map((size) => ({
                            id: new UniqueEntityID(size.sizeId),
                            name: size.size.name,
                        })),
                        productColors: productData.productColors.map(
                            (color) => ({
                                id: new UniqueEntityID(color.colorId),
                                name: color.color.name,
                                hex: color.color.hex,
                            })
                        ),
                        productCategories: productData.productCategories.map(
                            (category) => ({
                                id: new UniqueEntityID(category.categoryId),
                                name: category.category.name,
                            })
                        ),
                        materialId: productData.materialId
                            ? new UniqueEntityID(productData.materialId)
                            : undefined,
                        sizeId: productData.productSizes.map(
                            (size) => new UniqueEntityID(size.sizeId)
                        ),
                        finalPrice: productData.finalPrice ?? undefined,
                        brandId: new UniqueEntityID(productData.brandId),
                        brandName: productData.brand?.name ?? "Unknown Brand",
                        brandUrl: productData.brand?.imageUrl ?? "",
                        discount: productData.discount ?? undefined,
                        price: productData.price,
                        stock: productData.stock,
                        sku: productData.sku ?? "ntt",
                        height: productData.height ?? undefined,
                        width: productData.width ?? undefined,
                        length: productData.length ?? undefined,
                        weight: productData.weight ?? undefined,
                        onSale: productData.onSale ?? undefined,
                        isFeatured: productData.isFeatured ?? undefined,
                        hasVariants: productData.hasVariants ?? undefined,
                        isNew: productData.isNew ?? undefined,
                        images: productData.images ?? undefined,
                        slug: Slug.createFromText(productData.slug),
                        createdAt: new Date(productData.createdAt),
                        updatedAt: productData.updatedAt
                            ? new Date(productData.updatedAt)
                            : undefined,
                    },
                    new UniqueEntityID(productData.id)
                )
            );

            return right(products);
        } catch (error) {
            console.error(
                `Failed to retrieve products for name: ${name}, Error: ${error}`
            );
            return left(
                new ResourceNotFoundError(
                    `Failed to retrieve products for name: ${name}`
                )
            );
        }
    }

    async findByCategoryId(
        categoryId: string
    ): Promise<Either<Error, Product[]>> {
        try {
          
            const productsData = await this.prisma.product.findMany({
                where: {
                    productCategories: {
                        some: {
                            categoryId: categoryId,
                        },
                    },
                },
                include: {
                    productColors: {
                        include: {
                            color: true,
                        },
                    },
                    productSizes: {
                        include: {
                            size: true,
                        },
                    },
                    productCategories: {
                        include: {
                            category: true,
                        },
                    },
                    brand: true,
                    material: true,
                    productVariants: true,
                },
            });

            if (!productsData.length) {
                return left(
                    new ResourceNotFoundError(
                        `No products found for categoryId: ${categoryId}`
                    )
                );
            }

            const products = productsData.map((productData) =>
                Product.create(
                    {
                        name: productData.name,
                        description: productData.description,
                        productSizes: productData.productSizes.map((size) => ({
                            id: new UniqueEntityID(size.sizeId),
                            name: size.size.name,
                        })),
                        productColors: productData.productColors.map(
                            (color) => ({
                                id: new UniqueEntityID(color.colorId),
                                name: color.color.name,
                                hex: color.color.hex,
                            })
                        ),
                        productCategories: productData.productCategories.map(
                            (category) => ({
                                id: new UniqueEntityID(category.categoryId),
                                name: category.category.name,
                            })
                        ),
                        materialId: productData.materialId
                            ? new UniqueEntityID(productData.materialId)
                            : undefined,
                        sizeId: productData.productSizes.map(
                            (size) => new UniqueEntityID(size.sizeId)
                        ),
                        finalPrice: productData.finalPrice ?? undefined,
                        brandId: new UniqueEntityID(productData.brandId),
                        brandName: productData.brand?.name ?? "Unknown Brand",
                        brandUrl:
                            productData.brand?.imageUrl ??
                            "Unknown Brand image",
                        discount: productData.discount ?? undefined,
                        price: productData.price,
                        stock: productData.stock,
                        sku: productData.sku ?? "ntt",
                        height: productData.height ?? undefined,
                        width: productData.width ?? undefined,
                        length: productData.length ?? undefined,
                        weight: productData.weight ?? undefined,
                        onSale: productData.onSale ?? undefined,
                        isFeatured: productData.isFeatured ?? undefined,
                        hasVariants: productData.hasVariants ?? undefined,
                        isNew: productData.isNew ?? undefined,
                        images: productData.images ?? undefined,
                        slug: Slug.createFromText(productData.slug),
                        createdAt: new Date(productData.createdAt),
                        updatedAt: productData.updatedAt
                            ? new Date(productData.updatedAt)
                            : undefined,
                    },
                    new UniqueEntityID(productData.id)
                )
            );

            return right(products);
        } catch (error) {
            console.error(
                `Failed to retrieve products for categoryId: ${categoryId}, Error: ${error}`
            );
            return left(
                new ResourceNotFoundError(
                    `Failed to retrieve products for categoryId: ${categoryId}`
                )
            );
        }
    }

    async findBySlug(slug: string): Promise<
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
    > {
        try {
          
            const productData = await this.prisma.product.findUnique({
                where: { slug: slug },
                include: {
                    productColors: {
                        include: {
                            color: true,
                        },
                    },
                    productSizes: {
                        include: {
                            size: true,
                        },
                    },
                    productCategories: {
                        include: {
                            category: true,
                        },
                    },
                    brand: true,
                    material: true,
                    productVariants: true,
                },
            });

            if (!productData) {
                console.error(`Product not found: ${slug}`); // Log de erro
                return left(
                    new ResourceNotFoundError(`Product not found: ${slug}`)
                );
            }
            const product = Product.create(
                {
                    name: productData.name,
                    description: productData.description,
                    productSizes: productData.productSizes.map((size) => ({
                        id: new UniqueEntityID(size.sizeId),
                        name: size.size.name,
                    })),
                    productColors: productData.productColors.map((color) => ({
                        id: new UniqueEntityID(color.colorId),
                        name: color.color.name,
                        hex: color.color.hex,
                    })),
                    productCategories: productData.productCategories.map(
                        (category) => ({
                            id: new UniqueEntityID(category.categoryId),
                            name: category.category.name,
                        })
                    ),
                    materialId: productData.materialId
                        ? new UniqueEntityID(productData.materialId)
                        : undefined,
                    sizeId: productData.productSizes.map(
                        (size) => new UniqueEntityID(size.sizeId)
                    ),
                    finalPrice: productData.finalPrice ?? undefined,
                    brandId: new UniqueEntityID(productData.brandId),

                    discount: productData.discount ?? undefined,
                    price: productData.price,
                    stock: productData.stock,
                    sku: productData.sku ?? "ntt",
                    height: productData.height ?? undefined,
                    width: productData.width ?? undefined,
                    length: productData.length ?? undefined,
                    weight: productData.weight ?? undefined,
                    onSale: productData.onSale ?? undefined,
                    productIdVariant:productData.productIdVariant ?? undefined,
                    isFeatured: productData.isFeatured ?? undefined,
                    hasVariants: productData.hasVariants ?? undefined,
                    isNew: productData.isNew ?? undefined,
                    images: productData.images ?? undefined,
                    createdAt: new Date(productData.createdAt),
                    updatedAt: productData.updatedAt
                        ? new Date(productData.updatedAt)
                        : undefined,
                },
                new UniqueEntityID(productData.id)
            );


            const uniqueColors = Array.from(
                new Map(
                    productData.productColors.map((color) => [
                        color.color.name,
                        {
                            id: color.color.id,
                            name: color.color.name,
                            hex: color.color.hex,
                        },
                    ])
                ).values()
            );

            const uniqueSizes = Array.from(
                new Map(
                    productData.productSizes.map((size) => [
                        size.size.name,
                        { id: size.size.id, name: size.size.name },
                    ])
                ).values()
            );
            const uniqueCategory = Array.from(
                new Map(
                    productData.productCategories.map((category) => [
                        category.category.name,
                        {
                            id: category.category.id,
                            name: category.category.name,
                        },
                    ])
                ).values()
            );

            const additionalInfo = {
                materialName: productData.material?.name ?? undefined,
                brandName: productData.brand?.name ?? undefined,
                colors: uniqueColors,
                sizes: uniqueSizes,
                categories: uniqueCategory,
                variants: productData.productVariants.map((variant) => ({
                    id: variant.id,
                    sizeId: variant.sizeId ?? undefined,
                    colorId: variant.colorId ?? undefined,
                    stock: variant.stock,
                    price: variant.price,
                    images: variant.images,
                    sku: variant.sku,
                })),
            };
         
            return right({ product, ...additionalInfo });
        } catch (error) {
            console.error(
                `Failed to retrieve product: ${slug}, Error: ${error}`
            );
            return left(
                new ResourceNotFoundError(`Failed to retrieve product: ${slug}`)
            );
        }
    }

    async findById(
        productId: string
    ): Promise<Either<Error, ProductWithVariants>> {
        try {
         

            const productData = await this.prisma.product.findUnique({
                where: {
                    id: productId,
                },
                include: {
                    productColors: {
                        include: {
                            color: true,
                        },
                    },
                    productSizes: {
                        include: {
                            size: true,
                        },
                    },
                    productCategories: {
                        include: {
                            category: true,
                        },
                    },
                    brand: true,
                    material: true,
                    productVariants: {
                        include: {
                            color: true,
                            size: true,
                        },
                    },
                },
            });

            if (!productData) {
                return left(
                    new ResourceNotFoundError(
                        `Product not found for id: ${productId}`
                    )
                );
            }

            const product = Product.create(
                {
                    name: productData.name,
                    description: productData.description,
                    productSizes: productData.productSizes.map((size) => ({
                        id: new UniqueEntityID(size.sizeId),
                        name: size.size.name,
                    })),
                    productColors: productData.productColors.map((color) => ({
                        id: new UniqueEntityID(color.colorId),
                        name: color.color.name,
                        hex: color.color.hex,
                    })),
                    productCategories: productData.productCategories.map(
                        (category) => ({
                            id: new UniqueEntityID(category.categoryId),
                            name: category.category.name,
                        })
                    ),
                    materialId: productData.materialId
                        ? new UniqueEntityID(productData.materialId)
                        : undefined,
                    finalPrice: productData.finalPrice ?? undefined,
                    brandId: new UniqueEntityID(productData.brandId),
                    brandName: productData.brand?.name ?? "Unknown Brand",
                    brandUrl:
                        productData.brand?.imageUrl ?? "Unknown Brand image",
                    discount: productData.discount ?? undefined,
                    price: productData.price,
                    stock: productData.stock,
                    sku: productData.sku ?? "ntt",
                    height: productData.height ?? undefined,
                    width: productData.width ?? undefined,
                    length: productData.length ?? undefined,
                    weight: productData.weight ?? undefined,
                    onSale: productData.onSale ?? undefined,
                    isFeatured: productData.isFeatured ?? undefined,
                    hasVariants: productData.hasVariants ?? undefined,
                    productIdVariant: productData.productIdVariant ?? undefined,
                    isNew: productData.isNew ?? undefined,
                    images: productData.images ?? undefined,
                    slug: Slug.createFromText(productData.slug),
                    createdAt: new Date(productData.createdAt),
                    updatedAt: productData.updatedAt
                        ? new Date(productData.updatedAt)
                        : undefined,
                },
                new UniqueEntityID(productData.id)
            );
          

            const productVariants = productData.productVariants.map((variant) =>
                ProductVariant.create(
                    {
                        productId: new UniqueEntityID(variant.productId),
                        colorId: variant.color
                            ? new UniqueEntityID(variant.color.id)
                            : undefined,
                        sizeId: variant.size
                            ? new UniqueEntityID(variant.size.id)
                            : undefined,
                        sku: variant.sku,
                        upc: variant.upc ?? undefined,
                        stock: variant.stock,
                        price: variant.price,
                        images: variant.images,
                        status: toDomainProductStatus(variant.status),
                        createdAt: variant.createdAt,
                        updatedAt: variant.updatedAt ?? undefined,
                    },
                    new UniqueEntityID(variant.id)
                    
                )
            );
         

            return right(
                ProductWithVariants.create({
                    product,
                    variants: productVariants,
                })
            );
        } catch (error) {
            console.error(
                `Failed to retrieve product for id: ${productId}, Error: ${error}`
            );
            return left(
                new ResourceNotFoundError(
                    `Failed to retrieve product for id: ${productId}`
                )
            );
        }
    }

   

    async save(
        productOrProductWithVariants: Product | ProductWithVariants
    ): Promise<Either<ResourceNotFoundError, void>> {
        try {
            let product: Product;
            let variants: Array<{
                id: UniqueEntityID;
                productId: UniqueEntityID;
                colorId?: UniqueEntityID;
                sizeId?: UniqueEntityID;
                sku: string;
                upc?: string;
                stock: number;
                price: number;
                images: string[];
                status: PrismaProductStatus;
                createdAt: Date;
                updatedAt?: Date;
            }> = [];

            if (productOrProductWithVariants instanceof Product) {
                product = productOrProductWithVariants;
            } else {
                product = productOrProductWithVariants.product;
                variants = productOrProductWithVariants.variants;
            }

            await this.prisma.product.update({
                where: { id: product.id.toString() },
                data: {
                    name: product.name,
                    description: product.description,
                    materialId: product.materialId?.toString(),
                    brandId: product.brandId.toString(),
                    discount: product.discount,
                    price: product.price,
                    finalPrice: product.finalPrice,
                    height: product.height,
                    width: product.width,
                    length: product.length,
                    weight: product.weight,
                    onSale: product.onSale,
                    isFeatured: product.isFeatured,
                    isNew: product.isNew,
                    images: product.images,
                    stock: product.stock,
                    sku: product.sku,
                    erpId: product.erpId,
                    slug: product.slug.toString(),
                    updatedAt: new Date(),
                },
            });

            await Promise.all(
                variants.map(async (variant) => {
                    await this.prisma.productVariant.update({
                        where: { id: variant.id.toString() },
                        data: {
                            productId: variant.productId.toString(),
                            colorId: variant.colorId?.toString(),
                            sizeId: variant.sizeId?.toString(),
                            sku: variant.sku,
                            upc: variant.upc,
                            stock: variant.stock,
                            price: variant.price,
                            images: variant.images,
                            status: variant.status,
                            updatedAt: new Date(),
                        },
                    });
                })
            );

            return right(undefined);
        } catch (error) {
            const id =
                productOrProductWithVariants instanceof ProductWithVariants
                    ? productOrProductWithVariants.product.id.toString()
                    : productOrProductWithVariants.id.toString();
            return left(
                new ResourceNotFoundError(
                    `Failed to save product with id: ${id}`
                )
            );
        }
    }

    async updateVariant(
        variant: ProductVariant
    ): Promise<Either<ResourceNotFoundError, void>> {
        try {
            const existingVariant = await this.prisma.productVariant.findUnique(
                {
                    where: { id: variant.id.toString() },
                }
            );

            if (!existingVariant) {
                return left(
                    new ResourceNotFoundError(
                        `Variant not found for id: ${variant.id.toString()}`
                    )
                );
            }

            await this.prisma.productVariant.update({
                where: { id: variant.id.toString() },
                data: {
                    productId: variant.productId.toString(),
                    colorId: variant.colorId?.toString(),
                    sizeId: variant.sizeId?.toString(),
                    sku: variant.sku,
                    upc: variant.upc,
                    stock: variant.stock,
                    price: variant.price,
                    images: variant.images,
                    status: variant.status as PrismaProductStatus,
                    updatedAt: new Date(),
                },
            });

            return right(undefined);
        } catch (error) {
            return left(
                new ResourceNotFoundError(
                    `Failed to update variant with id: ${variant.id.toString()}`
                )
            );
        }
    }

    async delete(product: Product): Promise<void> {
        await this.prisma.product.delete({
            where: { id: product.id.toString() },
        });
    }
}
