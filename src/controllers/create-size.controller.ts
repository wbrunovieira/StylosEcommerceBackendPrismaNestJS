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
