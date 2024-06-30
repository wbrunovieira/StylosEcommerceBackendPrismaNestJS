import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.BASE_URL;
const AUTH_URL = process.env.AUTH_URL;
const API_URL_CREATE_CATEGORY = process.env.API_URL;
const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;

const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Name must not be empty')
    .max(20, 'Name must not exceed 20 characters'),
  imageUrl: z
    .string()
    .url('Invalid URL format')
    .nonempty('Image URL must not be empty'),
});

const categoryImages = {
  8: 'public/acessorios.svg',
  11: 'public/ballet-shoes.svg',
  10: 'public/ballet-shoes.svg',
  43: 'public/bikini.svg',
  52: 'public/bodysuit.svg',
  25: 'public/bag-mini.svg',
  26: 'public/scarf.svg',
  53: 'public/underwear.svg',
  46: 'public/camisole.svg',
  33: 'public/nightie.svg',
  34: 'public/pamela-hat.svg',
  35: 'public/flip-flops.svg',
  38: 'public/flip-flops.svg',
  56: 'public/windbreaker.svg',
  49: 'public/sex-lube.svg',
  13: 'public/skincare.svg',
  15: 'public/skincare.svg',
  19: 'public/skincare.svg',
  17: 'public/skincare.svg',
  31: 'public/boy.svg',
  5: 'public/package.svg',
  50: 'public/mask.svg',
  23: 'public/extended.svg',
  18: 'public/extended.svg',
  41: 'public/pregnant-woman.svg',
  37: 'public/hydrated-skin.svg',
  27: 'public/scarf (1).svg',
  9: 'public/lingeries.svg',
  32: 'public/love.svg',
  44: 'public/swimsuit.svg',
  20: 'public/socks.svg',
  21: 'public/woman (1).svg',
  39: 'public/sport.svg',
  28: 'public/glasses-mini.svg',
  30: 'public/glasses-mini.svg',
  51: 'public/dry-skin.svg',
  16: 'public/perfume-mini.svg',
  22: 'public/dry-skin.svg',
};

const defaultImage = 'public/no-photos.svg';

@Injectable()
export class SyncCategoriesService {
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
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.access_token;
    } catch (error) {
      console.error('Authentication error:', error);
      throw new Error('Failed to authenticate');
    }
  }

  async fetchCategories(token: string) {
    try {
      if (!API_URL_CREATE_CATEGORY) {
        return null;
      }

      const response = await axios.get(API_URL_CREATE_CATEGORY, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const categories = response.data.data.filter(
        (category: any) => !category.properties.deleted_at
      );

      for (const category of categories) {
        const imageUrl = categoryImages[category.id] || defaultImage;
        const categoryData = {
          name: category.properties.name,
          imageUrl,
        };

        try {
          createCategorySchema.parse(categoryData);
          await this.createCategory(categoryData, token);
        } catch (error) {
          console.error('Validation or creation error:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  async createCategory(
    categoryData: { name: string; imageUrl: string },
    token: string
  ) {
    try {
      const response = await axios.post(`${BASE_URL}/category`, categoryData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Category created:', response.data);
    } catch (error) {
      console.error('Error creating category:', error);
    }
  }

  async syncCategories() {
    try {
      const token = await this.authenticate();
      await this.fetchCategories(token);
    } catch (error) {
      console.error('Error in main execution:', error);
    }
  }
}
