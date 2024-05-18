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
  UseGuards,
} from "@nestjs/common";

import { CreateSizeUseCase } from "@/domain/catalog/application/use-cases/create-size";

import { DeleteSizeUseCase } from "@/domain/catalog/application/use-cases/delete-size";
import { EditSizeUseCase } from "@/domain/catalog/application/use-cases/edit-size";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { RolesGuard } from "@/auth/roles.guard";
import { Roles } from "@/auth/roles.decorator";

@Controller("size")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
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
