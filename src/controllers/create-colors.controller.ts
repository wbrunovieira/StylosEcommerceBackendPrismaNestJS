import { Body, Controller, Post, Get, Query, HttpStatus, HttpException, Param, BadRequestException, Delete, Put } from '@nestjs/common';
import { CreateColorUseCase } from '../domain/catalog/application/use-cases/create-color';
import { PrismaColorRepository } from '../domain/catalog/application/repositories/prisma-color-repository';

import { DeleteColorUseCase } from '@/domain/catalog/application/use-cases/delete-color';
import { EditColorUseCase } from '@/domain/catalog/application/use-cases/edit-color';

@Controller('colors')
export class ColorsController {
  constructor(private readonly createColorUseCase: CreateColorUseCase, private readonly PrismaColorRepository: PrismaColorRepository, private readonly deleteColorUseCase: DeleteColorUseCase,private readonly editColorUseCase: EditColorUseCase,) {}
  

  
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
  
      const pageInt = parseInt(page, 10) || 1;  
      const pageSizeInt = parseInt(pageSize, 10) || 10; 
  
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

  @Delete(':id')
  async deleteColor(@Param('id') id: string) {
    try {
      const result = await this.deleteColorUseCase.execute({ colorId: id });
      if (result.isLeft()) {
        throw new HttpException('Color not found', HttpStatus.NOT_FOUND);
      }
      return { message: 'Color deleted successfully' };
    } catch (error: unknown) {
      console.error("Erro ao deletar cor:", error);
      if (error instanceof HttpException) {
        if (error.getStatus() === HttpStatus.NOT_FOUND) {
          throw error;
        }
      }
      throw new HttpException('Failed to delete color', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async getColorById(@Param('id') id: string) {
    try {
      const color = await this.PrismaColorRepository.findById(id);
      if (!color) {
        throw new HttpException('Color not found', HttpStatus.NOT_FOUND);
      }
      return color;
    } catch (error) {
      console.error("Erro ao recuperar cor:", error);
      throw new HttpException('Failed to retrieve color', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async editColor(@Param('id') id: string, @Body() body: { name: string }) {
    try {
      const result = await this.editColorUseCase.execute({ colorId: id, name: body.name });
      if (result.isLeft()) {
        throw new HttpException('Color not found', HttpStatus.NOT_FOUND);
      }
      return result.value;
    } catch (error) {
      console.error("Erro ao editar cor:", error);
      throw new HttpException('Failed to edit color', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
}
