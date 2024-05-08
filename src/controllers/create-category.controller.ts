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

import { CreateCategoryUseCase } from "@/domain/catalog/application/use-cases/create-category";
import { PrismaCategoryRepository } from "@/domain/catalog/application/repositories/prisma-category-repository";
import { DeleteCategoryUseCase } from "@/domain/catalog/application/use-cases/delete-category";
import { EditCategoryUseCase } from "@/domain/catalog/application/use-cases/edit-category";

@Controller("category")
export class CategoryController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly prismaCategoryRepository: PrismaCategoryRepository,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
    private readonly editCategoryUseCase: EditCategoryUseCase
  ) {}

  @Post()
  async createCategory(@Body() body: { name: string }) {
    try {
      const result = await this.createCategoryUseCase.execute({
        name: body.name,
      });
      return result.value;
    } catch (error) {
      console.error("Erro ao criar category:", error);
      throw new HttpException(
        "Failed to create category",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  @Get()
  async findAllCategories(
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

      const categories = await this.prismaCategoryRepository.findAll({
        page: pageInt,
        pageSize: pageSizeInt,
      });
      return categories;
    } catch (error) {
      console.error("Erro ao recuperar category:", error);
      throw new HttpException(
        "Failed to retrieve category",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(":id")
  async deleteCategory(@Param("id") id: string) {
    try {
      const result = await this.deleteCategoryUseCase.execute({
        categoryId: id,
      });
      if (result.isLeft()) {
        throw new HttpException("category not found", HttpStatus.NOT_FOUND);
      }
      return { message: "category deleted successfully" };
    } catch (error: unknown) {
      console.error("Erro ao deletar category:", error);
      if (error instanceof HttpException) {
        if (error.getStatus() === HttpStatus.NOT_FOUND) {
          throw error;
        }
      }
      throw new HttpException(
        "Failed to delete category",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(":id")
  async getCategoryById(@Param("id") id: string) {
    try {
      const category = await this.prismaCategoryRepository.findById(id);
      if (!category) {
        throw new HttpException("category not found", HttpStatus.NOT_FOUND);
      }
      return category;
    } catch (error) {
      console.error("Erro ao recuperar category:", error);
      throw new HttpException(
        "Failed to retrieve category",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(":id")
  async editCategory(@Param("id") id: string, @Body() body: { name: string }) {
    try {
      const result = await this.editCategoryUseCase.execute({
        categoryId: id,
        name: body.name,
      });
      if (result.isLeft()) {
        throw new HttpException("category not found", HttpStatus.NOT_FOUND);
      }
      return result.value;
    } catch (error) {
      console.error("Erro ao editar category:", error);
      throw new HttpException(
        "Failed to edit category",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
