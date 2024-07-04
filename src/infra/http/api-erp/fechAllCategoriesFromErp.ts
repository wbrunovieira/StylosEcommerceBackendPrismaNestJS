import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { z } from 'zod';


const BASE_URL = process.env.BASE_URL;
const AUTH_URL = process.env.AUTH_URL;
const API_URL_CREATE_CATEGORY = process.env.API_URL_CREATE_CATEGORY;
const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;
const TOKEN_CONNECTPLUG = process.env.TOKEN_CONNECTPLUG;
const baseImageUrl = 'http://localhost:3000/public/';

const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Name must not be empty')
    .max(20, 'Name must not exceed 20 characters'),
  imageUrl: z
    .string()
    .url('Invalid URL format')
    .nonempty('Image URL must not be empty'),
    erpId: z
    .string()
    .optional()

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
  30: `${baseImageUrl}glasses-mini.svg`,
  51: `${baseImageUrl}dry-skin.svg`,
  16: `${baseImageUrl}perfume-mini.svg`,
  22: `${baseImageUrl}dry-skin.svg`,
};

const defaultImage = `${baseImageUrl}no-photos.svg`;

@Injectable()
export class SyncCategoriesUseCase {
  async authenticate() {
    console.log('entrou no authenticate')
    try {
      if (!AUTH_URL) {
        console.log('authenticate nao achou o url',AUTH_URL )
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

      console.log('authenticate response',response )
      
      console.log('authenticate response.data.access_token',response.data.access_token )
      const token = response.data.access_token
      console.log('token',token )
      return response.data.access_token;
    } catch (error) {
      console.error('Authentication error:', error);
      throw new Error('Failed to authenticate');
    }
  }
  
  async fetchCategories(token: string) {
    console.log('entrou no fetchCategories',token )
    try {
      if (!API_URL_CREATE_CATEGORY) {
        console.log('API_URL_CREATE_CATEGORY deu mal',API_URL_CREATE_CATEGORY )
        return null;
      }
      
      const response = await axios.get(API_URL_CREATE_CATEGORY, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `${TOKEN_CONNECTPLUG}`,
        },
      });
      console.log('response fetchCategories',response )
      
      const categories = response.data.data.filter(
        (category: any) => !category.properties.deleted_at
      );
      
      console.log('categories fetchCategories depois',categories )
      
      for (const category of categories) {
        const imageUrl = categoryImages[category.id] || defaultImage;
        const erpId = String(category.id); 
        console.log('erpId',erpId )
        console.log('for (const category of categories) {',category )
          const categoryData = {
            name: category.properties.name,
            imageUrl,
            erpId
          };
          console.log('for (const category of categories categoryData ',categoryData )
            
            try {
          console.log('try antes docreateCategorySchema')
          createCategorySchema.parse(categoryData);
          console.log('try depois docreateCategorySchema',categoryData )
         const createdCategory = await this.createCategory(categoryData, token);
          console.log('deu bom', createdCategory)
        } catch (error) {
          console.error('Validation or creation error:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }
  
  async createCategory(
    categoryData: { name: string; imageUrl: string; erpId?: string  },
    token: string
  ) {
    console.log('entrou no createCategory bom categoryData', categoryData)
    try {
      const response = await axios.post(`${BASE_URL}/category`, categoryData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('entrou no createCategory response', response)
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
