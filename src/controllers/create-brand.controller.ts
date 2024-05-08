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
import { PrismaBrandRepository } from "@/domain/catalog/application/repositories/prisma-brand-repository";
import { DeleteBrandUseCase } from "@/domain/catalog/application/use-cases/delete-brand";
import { EditBrandUseCase } from "@/domain/catalog/application/use-cases/edit-brand";

@Controller("brands")
export class BrandController {
  constructor(
    private readonly createBrandUseCase: CreateBrandUseCase,
    private readonly prismaBrandRepository: PrismaBrandRepository,
    private readonly deleteBrandUseCase: DeleteBrandUseCase,
    private readonly editBrandUseCase: EditBrandUseCase
  ) {}

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
  @Get()
  async findAllBrands(
    @Query("page") page: string,
    @Query("pageSize") pageSize: string
  ) {
    try {
      const pageInt = parseInt(page, 10) || 1;
      const pageSizeInt = parseInt(pageSize, 10) || 10;

      if (isNaN(pageInt) || isNaN(pageSizeInt)) {
        console.error("Invalid pagination parameters", {
          page: pageInt,
          pageSize: pageSizeInt,
        });
        throw new BadRequestException("Invalid pagination parameters");
      }

      const brands = await this.prismaBrandRepository.findAll({
        page: pageInt,
        pageSize: pageSizeInt,
      });
      return brands;
    } catch (error) {
      console.error("Erro ao recuperar brand:", error);
      throw new HttpException(
        "Failed to retrieve brand",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(":id")
  async deleteBrand(@Param("id") id: string) {
    try {
      const result = await this.deleteBrandUseCase.execute({ brandId: id });
      if (result.isLeft()) {
        throw new HttpException("brand not found", HttpStatus.NOT_FOUND);
      }
      return { message: "brand deleted successfully" };
    } catch (error: unknown) {
      console.error("Erro ao deletar brand:", error);
      if (error instanceof HttpException) {
        if (error.getStatus() === HttpStatus.NOT_FOUND) {
          throw error;
        }
      }
      throw new HttpException(
        "Failed to delete brand",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(":id")
  async getBrandById(@Param("id") id: string) {
    try {
      const brand = await this.prismaBrandRepository.findById(id);
      if (!brand) {
        throw new HttpException("brand not found", HttpStatus.NOT_FOUND);
      }
      return brand;
    } catch (error) {
      console.error("Erro ao recuperar brand:", error);
      throw new HttpException(
        "Failed to retrieve brand",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(":id")
  async editBrand(@Param("id") id: string, @Body() body: { name: string }) {
    try {
      const result = await this.editBrandUseCase.execute({
        brandId: id,
        name: body.name,
      });
      if (result.isLeft()) {
        throw new HttpException("brand not found", HttpStatus.NOT_FOUND);
      }
      return result.value;
    } catch (error) {
      console.error("Erro ao editar brand:", error);
      throw new HttpException(
        "Failed to edit brand",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
