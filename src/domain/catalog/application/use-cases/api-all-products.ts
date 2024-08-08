import { Injectable, InternalServerErrorException } from "@nestjs/common";
import axios from "axios";
import * as fs from "fs/promises";
import * as path from "path";
import { ConfigService } from "@nestjs/config";
import { Product, ProductProps } from "../../enterprise/entities/product";
import { Slug } from "../../enterprise/entities/value-objects/slug";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

@Injectable()
export class ApiGetAllProducts {
    private readonly apiUrl = "https://connectplug.com.br/api/v2/product?page=";
    private readonly token: string;

    constructor(private configService: ConfigService) {
        const token = this.configService.get<string>("TOKEN_CONNECTPLUG");
        if (!token) {
            throw new InternalServerErrorException(
                "TOKEN_CONNECTPLUG is not defined"
            );
        }
        this.token = token;
    }

    async fetchAndSaveProducts() {
        let page = 1;
        let allProducts: Product[] = [];
        let productCount = 0;

        try {
            while (true) {
                const response = await axios.get(`${this.apiUrl}${page}`, {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: `${this.token}`,
                    },
                });

                const products = response.data.data;
                console.log(`Page ${page} response:`, products);

                if (!Array.isArray(products) || products.length === 0) {
                    break;
                }

                const filteredProducts = products
                    .filter((product) => {
                        const isNotDeleted =
                            product.properties.deleted_at === null;
                        console.log(
                            `Product ${product.id} isNotDeleted: ${isNotDeleted}`
                        );
                        return isNotDeleted;
                    })
                    .map((product) => {
                        const productProps: ProductProps = {
                            name: product.properties.name,
                            description: product.properties.description || "",
                            price: product.properties.unitary_value,
                            stock: product.stock || 0,
                            sku: product.sku || "",
                            slug: Slug.createFromText(product.properties.name),
                            height: product.height || 0,
                            width: product.width || 0,
                            length: product.length || 0,
                            weight: product.weight || 0,
                            brandId: new UniqueEntityID(product.brand_id),
                            createdAt: new Date(product.created_at),
                            updatedAt: new Date(product.updated_at),
                            hasVariants: product.has_variants || false,
                            images: product.properties.image
                                ? [
                                      product.properties.image,
                                      ...(product.properties
                                          .additionals_photos || []),
                                  ]
                                : product.properties.additionals_photos || [],
                        };

                        const createdProduct = Product.create(
                            productProps,
                            new UniqueEntityID(product.id)
                        );

                        console.log(`Created product:`, createdProduct);

                        return createdProduct;
                    });

                console.log(
                    `Filtered products on page ${page}:`,
                    filteredProducts
                );

                allProducts = [...allProducts, ...filteredProducts];
                productCount += filteredProducts.length;

                console.log(
                    `Page ${page}: ${filteredProducts.length} produtos adicionados.`
                );
                console.log(`Total de produtos até agora: ${productCount}`);

                page++;
            }

            const filePath = path.resolve("/app/src", "products.json");
            await fs.writeFile(
                filePath,
                JSON.stringify(
                    { products: allProducts, count: productCount },
                    null,
                    2
                )
            );

            console.log(`Total de produtos salvos: ${productCount}`);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(
                    "Error fetching products:",
                    error.response ? error.response.data : error.message
                );
            } else {
                console.error("Unexpected error:", error);
            }
        }
    }
}
