import { Injectable } from "@nestjs/common";
import axios from "axios";

export interface Supplier {
    id: number;
    trade_name: string;
    company_name: string;
    document: string;
    address?: any;
}

@Injectable()
export class FetchAllSuppliersUseCase {
    private readonly baseUrl = "https://connectplug.com.br/api/v2/product";
    private readonly initialDelayTime = 800;
    private readonly maxDelayTime = 16000;
    private readonly tokenConnectPlug: string;

    constructor() {
        this.tokenConnectPlug = process.env.TOKEN_CONNECTPLUG || "";
    }

    async fetchAllSuppliers(): Promise<Supplier[]> {
        const suppliersMap: Record<number, Supplier> = {};

        let productId = 1;
        let delayTime = this.initialDelayTime;

        while (productId <= 5030) {
            try {
                const response = await this.fetchProductSuppliers(productId);
                const data = response.data.data;

                if (data && data.length > 0) {
                    data.forEach((item: any) => {
                        const supplier = item.relationships.supplier.data;
                        if (!suppliersMap[supplier.id]) {
                            suppliersMap[supplier.id] = {
                                id: supplier.id,
                                trade_name: supplier.properties.trade_name,
                                company_name: supplier.properties.company_name,
                                document: supplier.properties.document,
                                address: supplier.relationships?.address?.data,
                            };
                        }
                    });
                    delayTime = this.initialDelayTime; 
                } else {
                    console.log(
                        `No suppliers found for product ID ${productId}. Skipping.`
                    );
                }

                productId++;
                await this.delay(delayTime);
            } catch (error: any) {
                if (error.response && error.response.status === 401) {
                    console.error(
                        `Error fetching product ID ${productId}: Unauthorized (401).`
                    );
                    break; // Pare se houver um erro de autorização
                } else if (error.response && error.response.status === 429) {
                    console.warn(
                        `Rate limit exceeded for product ID ${productId}. Retrying after delay.`
                    );
                    await this.delay(delayTime);
                    delayTime = Math.min(delayTime * 2, this.maxDelayTime);
                    continue; // Continue tentando o mesmo ID
                } else if (error.response && error.response.status !== 404) {
                    console.error(
                        `Error fetching product ID ${productId}:`,
                        error.message
                    );
                }
                productId++;
            }
        }

        return Object.values(suppliersMap);
    }

    private async fetchProductSuppliers(productId: number) {
        return axios.get(`${this.baseUrl}/${productId}/supplier`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: this.tokenConnectPlug,
            },
        });
    }

    private delay(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
