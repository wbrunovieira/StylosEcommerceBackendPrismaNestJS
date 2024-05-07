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


import { CreateSizeUseCase } from "@/domain/catalog/application/use-cases/create-size";
import { PrismaSizeRepository } from "@/domain/catalog/application/repositories/prima-size-repository";
import { DeleteSizeUseCase } from "@/domain/catalog/application/use-cases/delete-size";
import { EditSizeUseCase } from "@/domain/catalog/application/use-cases/edit-size";

@Controller("size")
export class SizeController {
  constructor(
    private readonly createSizeUseCase: CreateSizeUseCase,
    private readonly PrismaSizeRepository: PrismaSizeRepository,
    private readonly deleteSizeUseCase: DeleteSizeUseCase,
    private readonly editSizeUseCase: EditSizeUseCase
  ) {}

  @Post()
  async createSize(@Body() body: { name: string }) {
    try {
      const result = await this.createSizeUseCase.execute({ name: body.name });
      return result.value;
    } catch (error) {
      console.error("Erro ao criar tamanho:", error);
      throw new HttpException(
        "Failed to create size",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  @Get()
  async findAllSizes(
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

      const sizes = await this.PrismaSizeRepository.findAll({
        page: pageInt,
        pageSize: pageSizeInt,
      });
      return sizes;
    } catch (error) {
      console.error("Erro ao recuperar cores:", error);
      throw new HttpException(
        "Failed to retrieve size",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(":id")
  async deleteSize(@Param("id") id: string) {
    try {
      const result = await this.deleteSizeUseCase.execute({ sizeId: id });
      if (result.isLeft()) {
        throw new HttpException("size not found", HttpStatus.NOT_FOUND);
      }
      return { message: "size deleted successfully" };
    } catch (error: unknown) {
      console.error("Erro ao deletar size:", error);
      if (error instanceof HttpException) {
        if (error.getStatus() === HttpStatus.NOT_FOUND) {
          throw error;
        }
      }
      throw new HttpException(
        "Failed to delete size",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(":id")
  async getSizeById(@Param("id") id: string) {
    try {
      const size = await this.PrismaSizeRepository.findById(id);
      if (!size) {
        throw new HttpException("size not found", HttpStatus.NOT_FOUND);
      }
      return size;
    } catch (error) {
      console.error("Erro ao recuperar size:", error);
      throw new HttpException(
        "Failed to retrieve size",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(":id")
  async editSize(@Param("id") id: string, @Body() body: { name: string }) {
    try {
      const result = await this.editSizeUseCase.execute({
        sizeId: id,
        name: body.name,
      });
      if (result.isLeft()) {
        throw new HttpException("size not found", HttpStatus.NOT_FOUND);
      }
      return result.value;
    } catch (error) {
      console.error("Erro ao editar cor:", error);
      throw new HttpException(
        "Failed to edit size",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
