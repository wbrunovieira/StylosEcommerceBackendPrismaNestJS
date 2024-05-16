import {
  Body,
  Controller,
  Post,
  HttpStatus,
  HttpException,
  UseGuards,
  Put,
  Param,
} from "@nestjs/common";
import { z } from "zod";
import { ZodValidationsPipe } from "../pipes/zod-validations-pipe";
import { CreateBrandUseCase } from "@/domain/catalog/application/use-cases/create-brand";

import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { RolesGuard } from "@/auth/roles.guard";
import { Roles } from "@/auth/roles.decorator";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { EditBrandUseCase } from "@/domain/catalog/application/use-cases/edit-brand";

const createBrandSchema = z.object({
  name: z
    .string()
    .min(1, "Name must not be empty")
    .max(50, "Name must not exceed 50 characters"),
});
const bodyValidationPipe = new ZodValidationsPipe(createBrandSchema);
type CreateBrandBodySchema = z.infer<typeof createBrandSchema>;


const editBrandSchema = z.object({
  name: z
    .string()
    .min(1, "Name must not be empty")
    .max(50, "Name must not exceed 50 characters"),
});
const editBodyValidationPipe = new ZodValidationsPipe(editBrandSchema);
type EditBrandBodySchema = z.infer<typeof editBrandSchema>;

@Controller("brands")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
export class BrandController {
  constructor(private readonly createBrandUseCase: CreateBrandUseCase,private readonly editBrandUseCase: EditBrandUseCase) {}

  @Post()
  async createBrand(@Body(bodyValidationPipe) body: CreateBrandBodySchema) {
    try {
      const result = await this.createBrandUseCase.execute({ name: body.name });
      if (result.isLeft()) {
        const error = result.value;
        if (error instanceof ResourceNotFoundError) {
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
      } else {
        return { brand: result.value.brand };
      }
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException("Failed to create brand", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(":brandId")
  async editBrand(
    @Param("brandId") brandId: string,
    @Body(editBodyValidationPipe) body: EditBrandBodySchema
  ) {
    try {
      const result = await this.editBrandUseCase.execute({
        brandId,
        name: body.name,
      });
      if (result.isLeft()) {
        const error = result.value;
        if (error instanceof ResourceNotFoundError) {
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
      } else {
        return { brand: result.value.brand };
      }
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException("Failed to update brand", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
