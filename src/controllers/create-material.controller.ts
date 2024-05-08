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
import { PrismaMaterialRepository } from "@/domain/catalog/application/repositories/prisma-material-repository";
import { DeleteMaterialUseCase } from "@/domain/catalog/application/use-cases/delete-material";
import { EditMaterialUseCase } from "@/domain/catalog/application/use-cases/edit-material";
  
  @Controller("materials")
  export class MaterialController {
    constructor(
      private readonly createMaterialUseCase: CreateMaterialUseCase,
      private readonly prismaMaterialepository: PrismaMaterialRepository,
      private readonly deleteMaterialdUseCase: DeleteMaterialUseCase,
      private readonly editMaterialUseCase: EditMaterialUseCase
    ) {}
  
    @Post()
    async createMaterial(@Body() body: { name: string }) {
      try {
        const result = await this.createMaterialUseCase.execute({ name: body.name });
        return result.value;
      } catch (error) {
        console.error("Erro ao criar material:", error);
        throw new HttpException(
          "Failed to create material",
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
    @Get()
    async findAllMaterials(
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
  
        const materials = await this.prismaMaterialepository.findAll({
          page: pageInt,
          pageSize: pageSizeInt,
        });
        return materials;
      } catch (error) {
        console.error("Erro ao recuperar material:", error);
        throw new HttpException(
          "Failed to retrieve material",
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  
    @Delete(":id")
    async deleteMaterial(@Param("id") id: string) {
      try {
        const result = await this.deleteMaterialdUseCase.execute({ materialId: id });
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
  
    @Get(":id")
    async getMaterialById(@Param("id") id: string) {
      try {
        const material = await this.prismaMaterialepository.findById(id);
        if (!material) {
          throw new HttpException("material not found", HttpStatus.NOT_FOUND);
        }
        return material;
      } catch (error) {
        console.error("Erro ao recuperar material:", error);
        throw new HttpException(
          "Failed to retrieve material",
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
  