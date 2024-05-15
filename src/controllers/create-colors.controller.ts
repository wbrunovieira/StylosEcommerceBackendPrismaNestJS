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
import { CreateColorUseCase } from "../domain/catalog/application/use-cases/create-color";


@Controller("colors")
export class ColorsController {
  constructor(
    private readonly createColorUseCase: CreateColorUseCase,
  
  ) {}

  @Post()
  async createColor(@Body() body: { name: string }) {
    try {
      const result = await this.createColorUseCase.execute({ name: body.name });
      return result.value;
    } catch (error) {
      console.error("Erro ao criar cor:", error);
      throw new HttpException(
        "Failed to create color",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
