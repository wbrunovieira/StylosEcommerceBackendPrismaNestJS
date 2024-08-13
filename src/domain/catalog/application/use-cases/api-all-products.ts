import { Injectable, InternalServerErrorException } from "@nestjs/common";
import axios from "axios";
import * as fs from "fs/promises";
import * as path from "path";
import { ConfigService } from "@nestjs/config";
import { Product, ProductProps } from "../../enterprise/entities/product";
import { Slug } from "../../enterprise/entities/value-objects/slug";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { ProductVariantProps } from "../../enterprise/entities/product-variant";
import { ProductStatus } from "../../enterprise/entities/product-status";

@Injectable()
export class ApiGetAllProducts {
    private readonly apiUrl = "https://connectplug.com.br/api/v2/product?page=";
    private readonly stockApiUrl =
        "https://connectplug.com.br/api/v2/product-stock-balance";
    private readonly categoriesApiUrl =
        "https://wbstylosbackend.sa.ngrok.io/category/all?page=1&pageSize=80";
    private readonly colorsApiUrl =
        "https://wbstylosbackend.sa.ngrok.io/colors/all?page=1&pageSize=80";
    private readonly sizesApiUrl =
        "https://wbstylosbackend.sa.ngrok.io/size/all?page=1&pageSize=80";

    private readonly token: string;

    private readonly startPage = 95;
    private readonly endPage = 97;

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
        let page = this.startPage;
        let allProducts: Product[] = [];
        let productCount = 0;
        let categoryErpId;

        const categoriesResponse = await axios.get(this.categoriesApiUrl);
        const categories = categoriesResponse.data.categories;
        console.log(`Fetched categories:`, categories);
        console.log(
            "Fetched categories erpId:ss",
            categories.map((cat) => cat.props.erpId)
        );

        const colorsResponse = await axios.get(this.colorsApiUrl);
        const colors = colorsResponse.data.colors;
        console.log(`Fetched colors:`, colors);

        const sizesResponse = await axios.get(this.sizesApiUrl);
        const sizes = sizesResponse.data.size;
        console.log(`Fetched sizes:`, sizes);

        try {
            while (page <= this.endPage) {
                const response = await axios.get(`${this.apiUrl}${page}`, {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: `${this.token}`,
                    },
                });

                const products = response.data.data;
                console.log(`Page ${page} responsess:`, products);

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
                        const productCategoryId =
                            product?.relationships?.category?.data?.id;

                        const productCategory = productCategoryId
                            ? categories.find((category) => {
                                  categoryErpId = Number(category.props.erpId);

                                  return categoryErpId === productCategoryId;
                              })
                            : null;
                        const productColors: {
                            id: UniqueEntityID;
                            name: string;
                            hex: string;
                        }[] = [];
                        const productSizes: {
                            id: UniqueEntityID;
                            name: string;
                        }[] = [];
                        const productVariants: ProductVariantProps[] = [];

                        if (product?.relationships?.attributes?.data) {
                            for (const attribute of product.relationships
                                .attributes.data) {
                                for (const option of attribute.relationships
                                    .options.data) {
                                    const matchingColor = colors.find(
                                        (c) =>
                                            Number(c.props.erpId) === option.id
                                    );

                                    const matchingSize = sizes.find(
                                        (s) =>
                                            Number(s.props.erpId) === option.id
                                    );
                                    console.log("matchingSize", matchingSize);
                                    if (matchingColor) {
                                        productColors.push({
                                            id: new UniqueEntityID(
                                                String(option.id)
                                            ),
                                            name: matchingColor.props.name,
                                            hex: matchingColor.props.hex,
                                        });
                                    }
                                    console.log("matchingColor", matchingColor);

                                    if (matchingSize) {
                                        productSizes.push({
                                            id: new UniqueEntityID(
                                                String(option.id)
                                            ),
                                            name: matchingSize.props.name,
                                        });
                                    }

                                    if (matchingColor || matchingSize) {
                                        productVariants.push({
                                            productId: product.id,
                                            colorId: matchingColor
                                                ? new UniqueEntityID(option.id)
                                                : undefined,
                                            sizeId: matchingSize
                                                ? new UniqueEntityID(option.id)
                                                : undefined,
                                            sku: product.sku || "",
                                            price: product.properties
                                                .unitary_value,
                                            stock: 0,
                                            images: product.properties.image
                                                ? [
                                                      product.properties.image,
                                                      ...(product.properties
                                                          .additionals_photos ||
                                                          []),
                                                  ]
                                                : product.properties
                                                      .additionals_photos || [],
                                            status: ProductStatus.ACTIVE,
                                            createdAt: new Date(),
                                            updatedAt: new Date(),
                                        });
                                    }
                                }
                            }
                        }
                        const brandId = "";

                        const productProps: ProductProps = {
                            erpId: String(product.id),
                            name: product.properties.name || "NameNotFound",
                            description: product.properties.description || "",
                            price: product.properties.unitary_value,
                            stock: 0,
                            productColors:
                                productColors.length > 0
                                    ? productColors
                                    : undefined,
                            productSizes:
                                productSizes.length > 0
                                    ? productSizes
                                    : undefined,

                            sku: product.sku || "",
                            slug: Slug.createFromText(product.properties.name),
                            height: product.height || 0,
                            width: product.width || 0,
                            length: product.length || 0,
                            weight: product.weight || 0,
                            brandId: new UniqueEntityID(brandId),
                            createdAt: new Date(product.created_at),
                            updatedAt: new Date(product.updated_at),
                            hasVariants:
                                productColors.length > 0 ||
                                productSizes.length > 0
                                    ? true
                                    : false,

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
                        console.log(
                            "productCategory aqquisss",
                            productCategory
                        );
                        const createdProduct = Product.create(
                            productProps,
                            new UniqueEntityID(product.id)
                        );
                        (createdProduct as any).categoryErpId = productCategory
                            ? productCategory.props.erpId
                            : null;

                        return createdProduct;
                    });

                console.log(
                    `Filtered products on pagessss ${page}:`,
                    filteredProducts
                );

                allProducts = [...allProducts, ...filteredProducts];
                productCount += filteredProducts.length;

                console.log(
                    `Page ${page}: ${filteredProducts.length} produtos adicionadossss.`
                );
                console.log(`Total de produtos até agorass: ${productCount}`);

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

                console.log(`Raw stockData novinhoss`, stockData);
                console.log("Before entering the loopss");
                console.log(
                    "Is stockData an arrays?",
                    Array.isArray(stockData)
                );
                if (Array.isArray(stockData)) {
                    for (const product of allProducts) {
                        console.log(`Checking products: ${product.erpId}`);
                        console.log(`product aqui mesmo s${product}`);
                        console.log(`entrou no fors`);
                        if (
                            product.erpId !== undefined &&
                            product.erpId !== null
                        ) {
                            const stockInfo = stockData.find(
                                (stock: { id: number }) =>
                                    stock.id === Number(product.erpId)
                            );

                            console.log(
                                `stockInfos  ${JSON.stringify(stockInfo)}`
                            );

                            if (stockInfo) {
                                const totalStock = stockInfo.bl;
                                console.log(`totalStocks  ${totalStock}`);
                                product.stock = totalStock;
                                console.log(
                                    `Product ${product.erpId} sstock updated: ${totalStock}`
                                );
                                console.log(
                                    ` product.stocks ${product.stock} `
                                );
                            } else {
                                console.log(
                                    `No stock info found for products ${product.erpId}`
                                );
                            }
                        } else {
                            console.warn(
                                `product.erpId is undefinesd or null for product`,
                                product
                            );
                        }
                    }
                } else {
                    console.error(
                        "stockData is not an array or is undefineds:",
                        stockData
                    );
                }
            } catch (err: any) {
                console.error(`Error fetching stocks`, err.message);
            }

            const filePath = path.resolve("/app/src", "products.json");

            await fs.writeFile(
                filePath,
                JSON.stringify(
                    {
                        products: allProducts,
                        count: productCount,
                    },
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
