import { Injectable, InternalServerErrorException } from "@nestjs/common";
import axios from "axios";
import * as fs from "fs";
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
    console.log("TOKEN_CONNECTPLUG:", this.token);
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

      console.log("API response received:", response.data);

      const products = response.data;
      const filePath = path.resolve("/app/src", "products.json");

      fs.writeFileSync(filePath, JSON.stringify(products, null, 2));

      console.log(`Products saved to ${filePath}`);
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
