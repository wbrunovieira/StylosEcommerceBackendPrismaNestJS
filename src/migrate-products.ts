import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import { Slug } from "./domain/catalog/enterprise/entities/value-objects/slug";
import * as fs from "fs/promises";
import { ProductStatus } from "./domain/catalog/enterprise/entities/product-status";
import { UniqueEntityID } from "./core/entities/unique-entity-id";
import { generateSlug } from "./domain/catalog/application/utils/generate-slug";
import { IProductColorRepository } from "./domain/catalog/application/repositories/i-product-color-repository";
import { IProductSizeRepository } from "./domain/catalog/application/repositories/i-product-size-repository";

@Injectable()
export class ProductMigrationService {
    private readonly logger = new Logger(ProductMigrationService.name);

    constructor(
        private readonly prisma: PrismaService,
        private productColorRepository: IProductColorRepository,
        private productSizeRepository: IProductSizeRepository
    ) {}
    private calculateFinalPrice(price: number, discount?: number): number {
        if (discount && discount > 0) {
            return price - price * (discount / 100);
        }
        return price;
    }
    async migrateProducts() {
        await this.prisma.onModuleInit();

        const data = await fs.readFile("./src/products3.json", "utf-8");
        const parsedData = JSON.parse(data);

        if (!Array.isArray(parsedData.products)) {
            throw new Error(
                "Invalid data format: 'products' should be an array."
            );
        }
        const brandId = "d828be47-46e3-425f-8ac8-7933b73ea026";

        const products = parsedData.products;

        for (const product of products) {
            const productName = product.props.name
                ? product.props.name
                : "NameNotFound";
            const productStock = product.props.stock || 0;
            if (!productName) {
                console.warn(
                    `Produto com ID ${product._id.value} não tem um nome definido. Pulando a migração desse produto.`
                );
                continue;
            }

            const productDescription = product.props.description
                ? product.props.description
                : "DescriptionNotFound";

            const productPrice = product.props.price
                ? product.props.price
                : "priceNotFound";

            let slug: Slug;

            if (productName) {
                slug = generateSlug(
                    productName,
                    brandId,
                    Date.now().toString()
                );
            } else {
                const uniqueSlug = `product-${Date.now()}`;
                slug = Slug.create(uniqueSlug);
                this.logger.warn(
                    `Produto com ID ${product._id.value} não tem um nome definido. Usando slug único: ${slug.value}`
                );
            }

            const images =
                Array.isArray(product.props.images) &&
                product.props.images.length > 0
                    ? product.props.images.map((image) => image.url)
                    : ["http://localhost:3000/public/images/LogoStylos.svg"];

            const productColors: { id: string }[] = [];
            for (const color of product.props.productColors || []) {
                const erpIdAsString = String(color.id.value);
                const realColor = await this.prisma.color.findFirst({
                    where: { erpId: erpIdAsString },
                });
                if (realColor) {
                    productColors.push({ id: realColor.id });
                } else {
                    this.logger.warn(
                        `Cor com erpId ${color.id.value} não encontrada.`
                    );
                }
            }

            const productSizes: { id: string }[] = [];
            for (const size of product.props.productSizes || []) {
                const erpIdAsString = String(size.id.value);
                const realSize = await this.prisma.size.findFirst({
                    where: { erpId: erpIdAsString },
                });
                if (realSize) {
                    productSizes.push({ id: realSize.id });
                } else {
                    this.logger.warn(
                        `Tamanho com erpId ${size.id.value} não encontrado.`
                    );
                }
            }

            const productCategories: { id: string }[] = [];
            for (const category of product.props.productCategories || []) {
                const realCategory = await this.prisma.category.findFirst({
                    where: { erpId: category.id.value },
                });
                if (realCategory) {
                    productCategories.push({ id: realCategory.id });
                } else {
                    this.logger.warn(
                        `Categoria com erpId ${category.id.value} não encontrada.`
                    );
                }
            }
            const finalPrice = this.calculateFinalPrice(
                productPrice,
                product.props.discount || 0
            );
            try {
                if (!productName) {
                    this.logger.warn(
                        `Produto com ID ${product._id.value} não tem um nome definido. Pulando a migração desse produto.`
                    );
                    continue;
                }
                const createdProduct = await this.prisma.product.create({
                    data: {
                        name: productName,
                        description: productDescription,
                        sku: product.sku,
                        price: productPrice,
                        stock: product.props.stock,
                        height: product.props.height,
                        brandId,
                        erpId: product.props.erpId,
                        slug: slug.value,
                        finalPrice,
                        width: product.props.width,
                        length: product.props.length,
                        weight: product.props.weight,
                        images: images,
                        status: ProductStatus.ACTIVE,

                        onSale: product.props.onSale || false,
                        discount: product.props.discount || 0,
                        isFeatured: product.props.isFeatured || false,
                        isNew: product.props.isNew || false,
                    },
                });
                console.log("createdProduct", createdProduct);

                const variants: Array<{
                    id: string;
                    productId: string;
                    sizeId?: string;
                    colorId?: string;
                    stock: number;
                    sku: string;
                    createdAt: Date;
                    updatedAt: Date;
                    price: number;
                    status: ProductStatus;
                    images: string[];
                }> = [];

                if (productSizes.length > 0 && productColors.length > 0) {
                    for (const size of productSizes) {
                        for (const color of productColors) {
                            variants.push({
                                id: new UniqueEntityID().toString(),
                                productId: createdProduct.id,
                                sizeId: size.id,
                                colorId: color.id,
                                stock: productStock,
                                sku: product.sku || "",
                                price: productPrice,
                                status: ProductStatus.ACTIVE,
                                images,
                                createdAt: new Date(Date.now()),
                                updatedAt: new Date(Date.now()),
                            });
                        }
                    }
                } else if (productSizes.length > 0) {
                    for (const size of productSizes) {
                        for (const sizeId of productSizes) {
                            await this.productSizeRepository.create(
                                product.id.toString(),
                                size.id
                            );
                        }
                        variants.push({
                            id: new UniqueEntityID().toString(),
                            productId: createdProduct.id,
                            sizeId: size.id,
                            stock: productStock,
                            sku: product.sku || "",
                            price: productPrice,
                            status: ProductStatus.ACTIVE,
                            images,
                            createdAt: new Date(Date.now()),
                            updatedAt: new Date(Date.now()),
                        });
                    }
                } else if (productColors.length > 0) {
                    for (const color of productColors) {
                        for (const colorId of productColors) {
                            await this.productColorRepository.create(
                                product.id.toString(),
                                color.id
                            );
                        }

                        variants.push({
                            id: new UniqueEntityID().toString(),
                            productId: createdProduct.id,
                            colorId: color.id,
                            sku: product.sku || "",
                            stock: productStock,
                            price: productPrice,
                            status: ProductStatus.ACTIVE,
                            images,
                            createdAt: new Date(Date.now()),
                            updatedAt: new Date(Date.now()),
                        });
                    }
                }
                console.log("variants", variants);
                if (variants.length > 0) {
                    product.hasVariants = true;
                    product.productIdVariant = product.id;
                    await this.prisma.productVariant.createMany({
                        data: variants,
                    });
                }

                this.logger.log(`Produto ${product.name} migrado com sucesso.`);
            } catch (error) {
                this.logger.error(
                    `Erro ao migrar o produto ${product.name}:`,
                    error
                );
            }
        }

        await this.prisma.onModuleDestroy();
    }
}
