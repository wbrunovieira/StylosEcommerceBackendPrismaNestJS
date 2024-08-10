import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import { Slug } from "./domain/catalog/enterprise/entities/value-objects/slug";
import * as fs from "fs/promises";

@Injectable()
export class ProductMigrationService {
    private readonly logger = new Logger(ProductMigrationService.name);

    constructor(private readonly prisma: PrismaService) {}

    async migrateProducts() {
        await this.prisma.onModuleInit();

        const data = await fs.readFile("./src/products.json", "utf-8");
        const parsedData = JSON.parse(data);

        if (!Array.isArray(parsedData.products)) {
            throw new Error(
                "Invalid data format: 'products' should be an array."
            );
        }

        const products = parsedData.products;

        for (const product of products) {
            const productName = product.props.name
                ? product.props.name
                : "NameNotFound";

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
                slug = Slug.createFromText(productName);
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

            try {
                if (!productName) {
                    this.logger.warn(
                        `Produto com ID ${product._id.value} não tem um nome definido. Pulando a migração desse produto.`
                    );
                    continue;
                }
                await this.prisma.product.create({
                    data: {
                        name: productName,
                        description: productDescription,
                        sku: product.sku,
                        price: productPrice,
                        stock: product.props.stock,
                        height: product.props.height,
                        slug: slug.value,
                        width: product.props.width,
                        length: product.props.length,
                        weight: product.props.weight,
                        images: images,
                        productColors:
                            productColors.length > 0
                                ? { connect: productColors as any }
                                : undefined,
                        productSizes:
                            productSizes.length > 0
                                ? { connect: productSizes as any }
                                : undefined,
                        productCategories:
                            productCategories.length > 0
                                ? { connect: productCategories as any }
                                : undefined,
                    },
                });
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
