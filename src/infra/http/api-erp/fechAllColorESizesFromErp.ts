import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { z } from 'zod';

const BASE_URL = process.env.BASE_URL;
const AUTH_URL = process.env.AUTH_URL;
const API_URL_PRODUCT_ATTRIBUTE = process.env.API_URL_PRODUCT_ATTRIBUTE;
const API_URL_CREATE_SIZE = process.env.API_URL_CREATE_SIZE;
const API_URL_CREATE_COLOR = process.env.API_URL_CREATE_COLOR;
const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;
const TOKEN_CONNECTPLUG = process.env.TOKEN_CONNECTPLUG;

const createSizeSchema = z.object({
  name: z
    .string()
    .min(1, 'Name must not be empty')
    .max(50, 'Name must not exceed 50 characters'),
});

const createColorSchema = z.object({
  name: z
    .string()
    .min(1, 'Name must not be empty')
    .max(50, 'Name must not exceed 50 characters'),
});

@Injectable()
export class SyncAttributesUseCase {
  async authenticate() {
    try {
      if (!AUTH_URL) {
        console.log('authenticate nao achou o url', AUTH_URL);
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

  async fetchAttributes(token: string) {
    try {
      if (!API_URL_PRODUCT_ATTRIBUTE) {
        console.log('API_URL_PRODUCT_ATTRIBUTE deu mal', API_URL_PRODUCT_ATTRIBUTE);
        return null;
      }

      const response = await axios.get(API_URL_PRODUCT_ATTRIBUTE, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const attributes = response.data.data.filter(
        (attribute: any) => !attribute.properties.deleted_at
      );

      for (const attribute of attributes) {
        const attributeData = {
          name: attribute.properties.name,
          code: attribute.properties.code
        };

        if (this.isSize(attributeData)) {
          await this.createSizeIfNotExist(attributeData, token);
        } else if (this.isColor(attributeData)) {
          await this.createColorIfNotExist(attributeData, token);
        }
      }
    } catch (error) {
      console.error('Error fetching attributes:', error);
    }
  }

  isSize(attribute: { name: string; code: string }): boolean {
    const sizeKeywords = ['size', 'tamanho', 'pequena', 'media', 'grande'];
    const normalizedAttributeName = this.normalizeString(attribute.name);
    return sizeKeywords.some(keyword => normalizedAttributeName.includes(keyword));
  }

  isColor(attribute: { name: string; code: string }): boolean {
    const colorKeywords = ['color', 'cor', 'vermelho', 'azul', 'preto'];
    const normalizedAttributeName = this.normalizeString(attribute.name);
    return colorKeywords.some(keyword => normalizedAttributeName.includes(keyword));
  }

  normalizeString(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  async sizeExists(name: string, token: string): Promise<boolean> {
    try {
      const response = await axios.get(`${BASE_URL}/sizes`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const sizes = response.data.data;
      const normalizedNewName = this.normalizeString(name);

      return sizes.some((size: any) => this.normalizeString(size.name) === normalizedNewName);
    } catch (error) {
      console.error('Error checking size existence:', error);
      return false;
    }
  }

  async colorExists(name: string, token: string): Promise<boolean> {
    try {
      const response = await axios.get(`${BASE_URL}/colors`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const colors = response.data.data;
      const normalizedNewName = this.normalizeString(name);

      return colors.some((color: any) => this.normalizeString(color.name) === normalizedNewName);
    } catch (error) {
      console.error('Error checking color existence:', error);
      return false;
    }
  }

  async createSizeIfNotExist(attributeData: { name: string; code: string }, token: string) {
    const { name } = attributeData;

    if (await this.sizeExists(name, token)) {
      console.log(`Size with name "${name}" already exists.`);
      return;
    }

    await this.createSize({ name }, token);
  }

  async createColorIfNotExist(attributeData: { name: string; code: string }, token: string) {
    const { name } = attributeData;

    if (await this.colorExists(name, token)) {
      console.log(`Color with name "${name}" already exists.`);
      return;
    }

    await this.createColor({ name }, token);
  }

  async createSize(sizeData: { name: string }, token: string) {
    try {
      const response = await axios.post(`${BASE_URL}/size`, sizeData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Size created:', response.data);
    } catch (error) {
      console.error('Error creating size:', error);
    }
  }

  async createColor(colorData: { name: string }, token: string) {
    try {
      const response = await axios.post(`${BASE_URL}/colors`, colorData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Color created:', response.data);
    } catch (error) {
      console.error('Error creating color:', error);
    }
  }

  async syncAttributes() {
    try {
      const token = await this.authenticate();
      await this.fetchAttributes(token);
    } catch (error) {
      console.error('Error in main execution:', error);
    }
  }
}
