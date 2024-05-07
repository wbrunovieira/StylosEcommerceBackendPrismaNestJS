import { Body, Controller, Post, Get, Query, HttpStatus, HttpException, Param, BadRequestException } from '@nestjs/common';
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
  async findAllColors(
    @Query('page') page: string,
    @Query('pageSize') pageSize: string
  ) {
    try {
      // Assegure-se de que 'page' e 'pageSize' são strings antes de passar para parseInt.
      const pageInt = parseInt(page, 10) || 1;  // Converta e use 1 como padrão se falhar
      const pageSizeInt = parseInt(pageSize, 10) || 10; // Converta e use 10 como padrão se falhar
  
      // Verifique se os números são válidos
      if (isNaN(pageInt) || isNaN(pageSizeInt)) {
        console.error('Invalid pagination parameters', { page: pageInt, pageSize: pageSizeInt });
        throw new BadRequestException('Invalid pagination parameters');
      }
  
      const colors = await this.PrismaColorRepository.findAll({ page: pageInt, pageSize: pageSizeInt });
      return colors;
    } catch (error) {
      console.error("Erro ao recuperar cores:", error);
      throw new HttpException('Failed to retrieve colors', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
}
