import { ApiGetAllProducts } from "@/domain/catalog/application/use-cases/api-all-products";
import { Controller, Get } from "@nestjs/common";

@Controller("api")
export class ApiController {
  constructor(private readonly productsService: ApiGetAllProducts) {}

  @Get("fetch-and-save")
  async fetchAndSaveProducts() {
    await this.productsService.fetchAndSaveProducts();
    return { message: "Products fetched and saved successfully" };
  }
}
