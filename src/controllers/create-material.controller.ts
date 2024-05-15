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

import { CreateMaterialUseCase } from "@/domain/catalog/application/use-cases/create-material";

import { DeleteMaterialUseCase } from "@/domain/catalog/application/use-cases/delete-material";
import { EditMaterialUseCase } from "@/domain/catalog/application/use-cases/edit-material";

@Controller("materials")
export class MaterialController {
  constructor(
    private readonly createMaterialUseCase: CreateMaterialUseCase,

    private readonly deleteMaterialdUseCase: DeleteMaterialUseCase,
    private readonly editMaterialUseCase: EditMaterialUseCase
  ) {}

  @Post()
  async createMaterial(@Body() body: { name: string }) {
    try {
      const result = await this.createMaterialUseCase.execute({
        name: body.name,
      });
      return result.value;
    } catch (error) {
      console.error("Erro ao criar material:", error);
      throw new HttpException(
        "Failed to create material",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(":id")
  async deleteMaterial(@Param("id") id: string) {
    try {
      const result = await this.deleteMaterialdUseCase.execute({
        materialId: id,
      });
      if (result.isLeft()) {
        throw new HttpException("material not found", HttpStatus.NOT_FOUND);
      }
      return { message: "material deleted successfully" };
    } catch (error: unknown) {
      console.error("Erro ao deletar material:", error);
      if (error instanceof HttpException) {
        if (error.getStatus() === HttpStatus.NOT_FOUND) {
          throw error;
        }
      }
      throw new HttpException(
        "Failed to delete material",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(":id")
  async editMaterial(@Param("id") id: string, @Body() body: { name: string }) {
    try {
      const result = await this.editMaterialUseCase.execute({
        materialId: id,
        name: body.name,
      });
      if (result.isLeft()) {
        throw new HttpException("material not found", HttpStatus.NOT_FOUND);
      }
      return result.value;
    } catch (error) {
      console.error("Erro ao editar material:", error);
      throw new HttpException(
        "Failed to edit material",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
