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

@Controller("size")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
export class SizeController {
  constructor(private readonly createSizeUseCase: CreateSizeUseCase) {}

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
}
