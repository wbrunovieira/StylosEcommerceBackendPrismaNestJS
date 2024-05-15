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

const createBrandSchema = z.object({
  name: z
    .string()
    .min(1, "Name must not be empty")
    .max(50, "Name must not exceed 50 characters"),
});
const bodyValidationPipe = new ZodValidationsPipe(createBrandSchema);
type CreateBrandBodySchema = z.infer<typeof createBrandSchema>;

@Controller("brands")
export class BrandController {
  constructor(private readonly createBrandUseCase: CreateBrandUseCase) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async createBrand(@Body(bodyValidationPipe) body: CreateBrandBodySchema) {
    try {
      const result = await this.createBrandUseCase.execute({ name: body.name });
      return result.value;
    } catch (error) {
      console.error("Erro ao criar brand:", error);
      throw new HttpException(
        "Failed to create brand",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
