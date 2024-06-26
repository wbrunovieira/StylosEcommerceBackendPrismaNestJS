import {
  Body,
  Controller,
  Post,
  Get,
  Query,
  HttpStatus,
  HttpException,
  Param,
  Delete,
  Put,
  UseGuards,
} from "@nestjs/common";

import { CreateMaterialUseCase } from "@/domain/catalog/application/use-cases/create-material";

import { EditMaterialUseCase } from "@/domain/catalog/application/use-cases/edit-material";
import { ZodValidationsPipe } from "@/pipes/zod-validations-pipe";
import { z } from "zod";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { RolesGuard } from "@/auth/roles.guard";
import { Roles } from "@/auth/roles.decorator";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { FindMaterialByNameUseCase } from "@/domain/catalog/application/use-cases/find-material-by-name";
import { FindMaterialByIdUseCase } from "@/domain/catalog/application/use-cases/find-material-by-id";
import { GetAllMaterialsUseCase } from "@/domain/catalog/application/use-cases/get-all-materials";
import { left } from "@/core/either";
import { DeleteMaterialUseCase } from "@/domain/catalog/application/use-cases/delete-material";

const createMaterialSchema = z.object({
  name: z
    .string()
    .min(1, "Name must not be empty")
    .max(50, "Name must not exceed 50 characters"),
});
const bodyValidationPipe = new ZodValidationsPipe(createMaterialSchema);
type CreateMaterialBodySchema = z.infer<typeof createMaterialSchema>;

const editMaterialSchema = z.object({
  name: z
    .string()
    .min(1, "Name must not be empty")
    .max(50, "Name must not exceed 50 characters"),
});
const editBodyValidationPipe = new ZodValidationsPipe(editMaterialSchema);
type EditMaterialBodySchema = z.infer<typeof editMaterialSchema>;

const paginationParamsSchema = z.object({
  page: z.preprocess((val) => Number(val), z.number().min(1).default(1)),
  pageSize: z.preprocess(
    (val) => Number(val),
    z.number().min(1).max(100).default(10)
  ),
});
const paginationPipe = new ZodValidationsPipe(paginationParamsSchema);
type PaginationParams = z.infer<typeof paginationParamsSchema>;

@Controller("materials")
export class MaterialController {
  constructor(
    private readonly createMaterialUseCase: CreateMaterialUseCase,
    private readonly editMaterialUseCase: EditMaterialUseCase,
    private readonly findMaterialByNameUseCase: FindMaterialByNameUseCase,
    private readonly findMaterialByIdUseCase: FindMaterialByIdUseCase,
    private readonly getAllMaterialUseCase: GetAllMaterialsUseCase,

    private readonly deleteMaterialdUseCase: DeleteMaterialUseCase
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  async createMaterial(
    @Body(bodyValidationPipe) body: CreateMaterialBodySchema
  ) {
    try {
      const result = await this.createMaterialUseCase.execute({
        name: body.name,
      });
      if (result.isLeft()) {
        const error = result.value;
        if (error instanceof ResourceNotFoundError) {
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
      } else {
        return { material: result.value.material };
      }
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(
        "Failed to create material",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  async deleteMaterial(@Param("id") id: string) {
    try {
      const result = await this.deleteMaterialdUseCase.execute({
        materialId: id,
      });
      if (result.isLeft()) {
        throw new HttpException("material not found", HttpStatus.NOT_FOUND);
      }
      return { message: "Material deleted successfully" };
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  async editMaterial(
    @Param("id") id: string,
    @Body(editBodyValidationPipe) body: EditMaterialBodySchema
  ) {
    try {
      const result = await this.editMaterialUseCase.execute({
        materialId: id,
        name: body.name,
      });
      if (result.isLeft()) {
        const error = result.value;
        if (error instanceof ResourceNotFoundError) {
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
      } else {
        return { material: result.value.material };
      }
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(
        "Failed to update material",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get()
  async findMaterialByName(@Query("name") name: string) {
    try {
      const result = await this.findMaterialByNameUseCase.execute({ name });
      if (result.isLeft()) {
        const error = result.value;
        if (error instanceof ResourceNotFoundError) {
          throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
      } else {
        return { material: result.value.material };
      }
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        "Failed to find material",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("all")
  async getAllMaterials(@Query(paginationPipe) params: PaginationParams) {
    try {
      const result = await this.getAllMaterialUseCase.execute(params);
      if (result.isLeft()) {
        throw new HttpException(
          "Failed to find materials",
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      } else {
        return { materials: result.value };
      }
    } catch (error) {
      return left(new Error("Repository error"));
    }
  }

  @Get(":id")
  async findMaterialById(@Param("id") id: string) {
    try {
      const result = await this.findMaterialByIdUseCase.execute({ id });
      if (result.isLeft()) {
        const error = result.value;
        if (error instanceof ResourceNotFoundError) {
          throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
      } else {
        return { material: result.value.material };
      }
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        "Failed to find material",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
