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

import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { RolesGuard } from "@/auth/roles.guard";
import { Roles } from "@/auth/roles.decorator";
import { EditSizeUseCase } from "@/domain/catalog/application/use-cases/edit-size";
import { ZodValidationsPipe } from "@/pipes/zod-validations-pipe";
import { z } from "zod";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { FindSizeByIdUseCase } from "@/domain/catalog/application/use-cases/find-size-by-id";

const createSizeSchema = z.object({
  name: z
    .string()
    .min(1, "Name must not be empty")
    .max(10, "Name must not exceed 10 characters"),
});
const bodyValidationPipe = new ZodValidationsPipe(createSizeSchema);
type CreateSizeBodySchema = z.infer<typeof createSizeSchema>;


const editSizeSchema = z.object({
  name: z
    .string()
    .min(1, "Name must not be empty")
    .max(50, "Name must not exceed 50 characters"),
});
const editBodyValidationPipe = new ZodValidationsPipe(editSizeSchema);
type EditSizeBodySchema = z.infer<typeof editSizeSchema>;

@Controller("size")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
export class SizeController {
  constructor(private readonly createSizeUseCase: CreateSizeUseCase,
              private readonly ediySizeUseCase: EditSizeUseCase,
              private readonly findSizeByIdUseCase: FindSizeByIdUseCase
  ) {}

  @Post()
  async createSize(@Body(bodyValidationPipe) body: CreateSizeBodySchema) {
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

  @Put(":sizeId")
  async editSize(
    @Param("sizeId") sizeId: string,
    @Body(editBodyValidationPipe) body: EditSizeBodySchema
  ) {
    try {
      const result = await this.ediySizeUseCase.execute({
        sizeId,
        name: body.name,
      });
      if (result.isLeft()) {
        const error = result.value;
        if (error instanceof ResourceNotFoundError) {
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
      } else {
        return { size: result.value.size };
      }
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(
        "Failed to update size",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(":id")
  async findSizeById(@Param("id") id: string) {
    try {
      const result = await this.findSizeByIdUseCase.execute({ id });
      if (result.isLeft()) {
        const error = result.value;
        if (error instanceof ResourceNotFoundError) {
          throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
      } else {
        return { size: result.value.size };
      }
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        "Failed to find size",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }


}
