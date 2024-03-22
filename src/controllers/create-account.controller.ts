import { ConflictException } from '@nestjs/common';
import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('/accounts')
export class CreateAccountController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @HttpCode(201)
  async handle(@Body() body: any) {
    const { name, email, password } = body;

    const userAlreadyExists = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (userAlreadyExists) {
      throw new ConflictException('User already exists');
    }

    await this.prisma.user.create({
      data: {
        name,
        email,
        password,
      },
    });
  }

  @Get()
  async show() {
    return await this.prisma.user.findMany();
  }
}
