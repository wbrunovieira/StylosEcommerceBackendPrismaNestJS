import {
  Body,
  Controller,
  Post,
  HttpStatus,
  HttpException,
  UseGuards,
} from "@nestjs/common";
import { z } from "zod";
import { ZodValidationsPipe } from "../pipes/zod-validations-pipe";
import { CreateBrandUseCase } from "@/domain/catalog/application/use-cases/create-brand";

import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { RolesGuard } from "@/auth/roles.guard";
import { Roles } from "@/auth/roles.decorator";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";

const createBrandSchema = z.object({
  name: z
    .string()
    .min(1, "Name must not be empty")
    .max(50, "Name must not exceed 50 characters"),
});
const bodyValidationPipe = new ZodValidationsPipe(createBrandSchema);
type CreateBrandBodySchema = z.infer<typeof createBrandSchema>;

@Controller("brands")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
export class BrandController {
  constructor(private readonly createBrandUseCase: CreateBrandUseCase) {}

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
      throw error;
    }
  }
}
