import { Injectable } from "@nestjs/common";
import axios from "axios";
import { z } from "zod";

const BASE_URL = process.env.BASE_URL;
const AUTH_URL = process.env.AUTH_URL;
const API_URL_CREATE_CATEGORY = process.env.API_URL_CREATE_CATEGORY;
const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;
const TOKEN_CONNECTPLUG = process.env.TOKEN_CONNECTPLUG;
const baseImageUrl = "http://localhost:3000/public/";

const createCategorySchema = z.object({
    name: z
        .string()
        .min(1, "Name must not be empty")
        .max(20, "Name must not exceed 20 characters"),
    imageUrl: z
        .string()
        .url("Invalid URL format")
        .nonempty("Image URL must not be empty"),
    erpId: z.string().optional(),
});

const categoryImages = {
    8: `${baseImageUrl}acessorios.svg`,
    11: `${baseImageUrl}ballet-shoes.svg`,
    10: `${baseImageUrl}ballet-shoes.svg`,
    43: `${baseImageUrl}bikini.svg`,
    52: `${baseImageUrl}bodysuit.svg`,
    25: `${baseImageUrl}bag-mini.svg`,
    26: `${baseImageUrl}scarf.svg`,
    53: `${baseImageUrl}underwear.svg`,
    46: `${baseImageUrl}camisole.svg`,
    33: `${baseImageUrl}nightie.svg`,
    34: `${baseImageUrl}pamela-hat.svg`,
    35: `${baseImageUrl}flip-flops.svg`,
    38: `${baseImageUrl}flip-flops.svg`,
    56: `${baseImageUrl}windbreaker.svg`,
    49: `${baseImageUrl}sex-lube.svg`,
    13: `${baseImageUrl}skincare.svg`,
    15: `${baseImageUrl}skincare.svg`,
    19: `${baseImageUrl}skincare.svg`,
    17: `${baseImageUrl}skincare.svg`,
    31: `${baseImageUrl}boy.svg`,
    5: `${baseImageUrl}package.svg`,
    50: `${baseImageUrl}mask.svg`,
    23: `${baseImageUrl}extended.svg`,
    18: `${baseImageUrl}extended.svg`,
    41: `${baseImageUrl}pregnant-woman.svg`,
    37: `${baseImageUrl}hydrated-skin.svg`,
    27: `${baseImageUrl}scarf (1).svg`,
    9: `${baseImageUrl}lingeries.svg`,
    32: `${baseImageUrl}love.svg`,
    44: `${baseImageUrl}swimsuit.svg`,
    20: `${baseImageUrl}socks.svg`,
    21: `${baseImageUrl}woman (1).svg`,
    39: `${baseImageUrl}sport.svg`,
    28: `${baseImageUrl}glasses-mini.svg`,
    29: `${baseImageUrl}bag.svg`,
    30: `${baseImageUrl}glasses-mini.svg`,
    51: `${baseImageUrl}dry-skin.svg`,
    16: `${baseImageUrl}perfume-mini.svg`,
    22: `${baseImageUrl}dry-skin.svg`,
    48: `${baseImageUrl}robe.svg`,
    45: `${baseImageUrl}manwear.svg`,
    55: `${baseImageUrl}ballet-shoes.svg`,
    40: `${baseImageUrl}robe.svg`,
    57: `${baseImageUrl}underware.svg`,
    12: `${baseImageUrl}bikini.svg`,
    47: `${baseImageUrl}nightie.svg`,
};

const defaultImage = `${baseImageUrl}no-photos.svg`;

@Injectable()
export class SyncCategoriesUseCase {
    async authenticate() {
        try {
            if (!AUTH_URL) {
                return null;
            }
            const response = await axios.post(
                AUTH_URL,
                {
                    email: EMAIL,
                    password: PASSWORD,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const token = response.data.access_token;

            return response.data.access_token;
        } catch (error) {
            console.error("Authentication error:", error);
            throw new Error("Failed to authenticate");
        }
    }

    async fetchCategories(token: string) {
        try {
            if (!API_URL_CREATE_CATEGORY) {
                return null;
            }

            const response = await axios.get(API_URL_CREATE_CATEGORY, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `${TOKEN_CONNECTPLUG}`,
                },
            });

            console.log("fetchCategories response", response);

            const categories = response.data.data.filter(
                (category: any) => !category.properties.deleted_at
            );

            for (const category of categories) {
                const imageUrl = categoryImages[category.id] || defaultImage;
                const erpId = String(category.id);
                console.log("fetchCategories erpId", erpId);
                const categoryData = {
                    name: category.properties.name,
                    imageUrl,
                    erpId,
                };
                
                console.log("fetchCategories categoryData", categoryData);

                try {
                    // createCategorySchema.parse(categoryData);

                    const createdCategory = await this.createCategory(
                        categoryData,
                        token
                    );
                    console.log(
                        "fetchCategories createdCategory",
                        createdCategory
                    );
                } catch (error) {
                    console.error("Validation or creation error:", error);
                }
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }

    normalizeString(str: string): string {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    }

    async categoryExists(
        name: string,
        erpId: string,
        token: string
    ): Promise<boolean> {
        try {
            const response = await axios.get(`${BASE_URL}/category`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const categories = response.data.data;
            const normalizedNewName = this.normalizeString(name);

            return categories.some(
                (category: any) =>
                    category.erpId === erpId ||
                    this.normalizeString(category.name) === normalizedNewName
            );
        } catch (error) {
            console.error("Error checking category existence:", error);
            return false;
        }
    }

    async createCategoryIfNotExist(
        categoryData: { name: string; imageUrl: string; erpId?: string },
        token: string
    ) {
        const { name, erpId } = categoryData;

        if (await this.categoryExists(name, erpId ?? "", token)) {
            return;
        }

        await this.createCategory(categoryData, token);
    }

    async createCategory(
        categoryData: { name: string; imageUrl: string; erpId?: string },
        token: string
    ) {
        try {
            const response = await axios.post(
                `${BASE_URL}/category`,
                categoryData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            console.log(`link: ${BASE_URL}/category`);
            console.log("createCategory responsea", response);
            console.log("createCategory categoryDataa", categoryData);
        } catch (error) {
            console.error("Error creating category:", error);
        }
    }

    async syncCategories() {
        try {
            const token = await this.authenticate();
            const syncedCategories = await this.fetchCategories(token);
            console.log(" syncedCategories", syncedCategories);
        } catch (error) {
            console.error("Error in main execution:", error);
        }
    }
}
