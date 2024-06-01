import { Injectable, InternalServerErrorException } from "@nestjs/common";
import axios from "axios";

import * as fs from "fs/promises";
import * as path from "path";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class ApiGetAllProducts {
  private readonly apiUrl = "https://connectplug.com.br/api/v2/product";
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
    try {
      const response = await axios.get(this.apiUrl, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `${this.token}`,
        },
      });

    
      


      const products = response.data.data; 
      if (!Array.isArray(products)) {
        throw new Error("Expected an array of products");
      }

      const extractedProducts = products.map(product => ({
        id: product.id,
        name: product.properties.name,
        description: product.properties.description,
        unitary_value: product.properties.unitary_value,
        image: product.properties.image,
        additionals_photos: product.properties.additionals_photos,
      }));
      
      const productCount = extractedProducts.length;

      

      const filePath = path.resolve("/app/src", "products.json");

      await fs.writeFile(filePath, JSON.stringify({ products: extractedProducts, count: productCount }, null, 2));

     
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
