import {
  Body,
  Controller,
  Post,
  Get,
  Query,
  HttpStatus,
  HttpException,
  Param,
  BadRequestException,
  Delete,
  Put,
} from "@nestjs/common";

import { CreateBrandUseCase } from "@/domain/catalog/application/use-cases/create-brand";

@Controller("brands")
export class BrandController {
  constructor(private readonly createBrandUseCase: CreateBrandUseCase) {}

  @Post()
  async createBrand(@Body() body: { name: string }) {
    try {
      const result = await this.createBrandUseCase.execute({ name: body.name });
      return result.value;
    } catch (error) {
      console.error("Erro ao criar brand:", error);
      throw new HttpException(
        "Failed to create brand",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
