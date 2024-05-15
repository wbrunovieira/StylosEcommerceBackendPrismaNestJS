import {
  ConflictException,
  Delete,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Body, Controller, HttpCode, Post, UsePipes } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { ZodValidationsPipe } from 'src/pipes/zod-validations-pipe';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';

const createAccountBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['user', 'admin']).default('user'),

});

const createGoogleAccountBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  googleUserId: z.string(),
  profileImageUrl: z.string(),
  role: z.enum(['user', 'admin']).default('user'),
});

const updateUserBodySchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(['user', 'admin']).optional(),
});

type UpdateUserBodySchema = z.infer<typeof updateUserBodySchema>;

type CreateGoogleAccountBodySchema = z.infer<
  typeof createGoogleAccountBodySchema
>;

type CreateAccountBodyBodySchema = z.infer<typeof createAccountBodySchema>;

@Controller('/accounts')
export class CreateAccountController {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService
  ) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationsPipe(createAccountBodySchema))
  async handle(@Body() body: CreateAccountBodyBodySchema) {
    const { name, email, password , role } = body;

    const userAlreadyExists = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (userAlreadyExists) {
      throw new ConflictException('User already exists');
    }

    const hashPassword = await hash(password, 8);

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashPassword,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
    const accessToken = this.jwt.sign({ sub: user.id, role: user.role });
    
    return { user, accessToken };
  }
  @Post('/google')
  @HttpCode(201)
  @UsePipes(new ZodValidationsPipe(createGoogleAccountBodySchema))
  async handleGoogleAccountCreation(
    @Body() body: CreateGoogleAccountBodySchema
  ) {
    
    const { name, email, googleUserId, profileImageUrl, role } = body;

    const userAlreadyExists = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (userAlreadyExists) {
      throw new ConflictException('User already exists');
    }

    const hashPassword = await hash('senha_padrao_qualquer', 8);

    const newUser = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashPassword,
        googleUserId,
        isGoogleUser: true,
        profileImageUrl,
        role,
      },
      select: {
        id: true,

        email: true,
        role: true,
      },
    });
    
    return newUser;
  }

  @Delete('/:id')
  @HttpCode(204)
  async deleteAccount(@Param('id') id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    if (!user) {
      throw new ConflictException('User not found');
    }
    await this.prisma.user.delete({
      where: {
        id: id,
      },
    });
  }

  @Post('/check')
  async checkUserByEmail(@Body('email') email: string) {
    if (!email) {
      throw new HttpException(
        'Email is required in request body',
        HttpStatus.BAD_REQUEST
      );
    }

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      return true;
    }

    return false;
  }

  @Put('/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateUser(@Param('id') id: string, @Body() body: any) {
    const { name, email, password, role } = body;
   

    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const updatedUserData: any = {};

    if (name !== undefined) updatedUserData.name = name;
    if (email !== undefined) updatedUserData.email = email;
    if (password !== undefined) {
      const hashPassword = await hash(password, 8);
      updatedUserData.password = hashPassword;
    }
    if (role !== undefined) updatedUserData.role = role;

    const updatedUser = await this.prisma.user.update({
      where: {
        id,
      },
      data: updatedUserData,
    });

    return updatedUser;
  }
}
