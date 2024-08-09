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
    private readonly stockApiUrl =
        "https://connectplug.com.br/api/v2/product-stock-balance";
    private readonly categoriesApiUrl =
        "https://wbstylosbackend.sa.ngrok.io/category/all?page=1&pageSize=80";

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

        const categoriesResponse = await axios.get(this.categoriesApiUrl);
        const categories = categoriesResponse.data.categories;
        console.log(`Fetched categories:aaa`, categories);
        console.log(
            "Fetched categories erpId:",
            categories.map((cat) => cat.props.erpId)
        );

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

                        return isNotDeleted;
                    })
                    .map((product) => {
                        const productCategory = categories.find((category) => {
                            const productCategoryId =
                                product?.relationships?.category?.data?.id;
                            if (!productCategoryId) {
                                console.warn(
                                    "Product does not have a valid category ID:",
                                    product
                                );
                                return false;
                            }
                            const categoryErpId = Number(category.props.erpId);
                            return categoryErpId === productCategoryId;
                        });
                        console.log(
                            "product?.relationships?.category?.data?.id aqqui",
                            product?.relationships?.category?.data?.id
                        );
                        console.log("productCategory aqui:", productCategory);

                        const productProps: ProductProps = {
                            erpId: product.id,
                            name: product.properties.name,
                            description: product.properties.description || "",
                            price: product.properties.unitary_value,
                            stock: 0,
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
                            productCategories: productCategory
                                ? [
                                      {
                                          id: new UniqueEntityID(
                                              productCategory._id.value
                                          ),
                                          name: productCategory.props.name,
                                      },
                                  ]
                                : [
                                      {
                                          id: new UniqueEntityID(
                                              "NoCategoryFromERP"
                                          ),
                                          name: "NoCategoryFromERP",
                                      },
                                  ],
                            images: product.properties.image
                                ? [
                                      product.properties.image,
                                      ...(product.properties
                                          .additionals_photos || []),
                                  ]
                                : product.properties.additionals_photos || [],
                        };
                        console.log("productCategory aqqui", productCategory);
                        const createdProduct = Product.create(
                            productProps,
                            new UniqueEntityID(product.id)
                        );

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

            try {
                const stockResponse = await axios.get(`${this.stockApiUrl}`, {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: `${this.token}`,
                    },
                });

                const stockData = stockResponse.data.data;

                console.log(`Raw stockData novinho`, stockData);
                console.log("Before entering the loop");
                console.log("Is stockData an array?", Array.isArray(stockData));
                if (Array.isArray(stockData)) {
                    for (const product of allProducts) {
                        console.log(`Checking product: ${product.erpId}`);
                        console.log(`product aqui mesmo ${product}`);
                        console.log(`entrou no for`);
                        if (
                            product.erpId !== undefined &&
                            product.erpId !== null
                        ) {
                            const stockInfo = stockData.find(
                                (stock: { id: number }) =>
                                    stock.id === Number(product.erpId)
                            );

                            console.log(
                                `stockInfo  ${JSON.stringify(stockInfo)}`
                            );

                            if (stockInfo) {
                                const totalStock = stockInfo.bl;
                                console.log(`totalStock  ${totalStock}`);
                                product.stock = totalStock;
                                console.log(
                                    `Product ${product.erpId} stock updated: ${totalStock}`
                                );
                                console.log(` product.stock ${product.stock} `);
                            } else {
                                console.log(
                                    `No stock info found for product ${product.erpId}`
                                );
                            }
                        } else {
                            console.warn(
                                `product.erpId is undefined or null for product`,
                                product
                            );
                        }
                    }
                } else {
                    console.error(
                        "stockData is not an array or is undefined:",
                        stockData
                    );
                }
            } catch (err: any) {
                console.error(`Error fetching stock`, err.message);
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
