import { Body, Controller, Post, Get, Query, HttpStatus, HttpException } from '@nestjs/common';
import { CreateColorUseCase } from '../domain/catalog/application/use-cases/create-color';
import { PrismaColorRepository } from '../domain/catalog/application/repositories/prisma-color-repository';
import { PaginationParams } from '@/core/repositories/pagination-params';

@Controller('colors')
export class ColorsController {
  constructor(private readonly createColorUseCase: CreateColorUseCase, private readonly PrismaColorRepository: PrismaColorRepository) {}

  @Post()
  async createColor(@Body() body: { name: string }) {
    try {
      const result = await this.createColorUseCase.execute({ name: body.name });
      return result.value;
    } catch (error) {
      console.error("Erro ao criar cor:", error);
      throw new HttpException('Failed to create color', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async findAllColors(@Query() params: PaginationParams) {
    try {
      const colors = await this.PrismaColorRepository.findAll(params);
      return colors;
    } catch (error) {
      throw new HttpException('Failed to retrieve colors', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
