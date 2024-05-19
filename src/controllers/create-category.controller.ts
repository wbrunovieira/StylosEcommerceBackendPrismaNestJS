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

import { CreateCategoryUseCase } from "@/domain/catalog/application/use-cases/create-category";

import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { RolesGuard } from "@/auth/roles.guard";
import { Roles } from "@/auth/roles.decorator";
import { ZodValidationsPipe } from "@/pipes/zod-validations-pipe";
import { z } from "zod";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";

const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Name must not be empty")
    .max(20, "Name must not exceed 20 characters"),
});
const bodyValidationPipe = new ZodValidationsPipe(createCategorySchema);
type CreateCategoryBodySchema = z.infer<typeof createCategorySchema>;

@Controller("category")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
export class CategoryController {
  constructor(private readonly createCategoryUseCase: CreateCategoryUseCase) {}

  @Post()
  async createCategory(
    @Body(bodyValidationPipe) body: CreateCategoryBodySchema
  ) {
    try {
      const result = await this.createCategoryUseCase.execute({
        name: body.name,
      });
      if (result.isLeft()) {
        const error = result.value;
        if (error instanceof ResourceNotFoundError) {
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
      } else {
        return { category: result.value.category };
      }
    } catch (error) {
      console.error("Erro ao criar category:", error);
      throw new HttpException(
        "Failed to create category",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
