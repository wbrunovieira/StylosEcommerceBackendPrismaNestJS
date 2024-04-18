import { ConflictException } from '@nestjs/common';
import { Body, Controller, HttpCode, Post, UsePipes } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { ZodValidationsPipe } from 'src/pipes/zod-validations-pipe';
import { profile } from 'node:console';

const createAccountBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
});

const createGoogleAccountBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  googleUserId: z.string(),
  profileImageUrl: z.string(),
});

type CreateGoogleAccountBodySchema = z.infer<
  typeof createGoogleAccountBodySchema
>;

type CreateAccountBodyBodySchema = z.infer<typeof createAccountBodySchema>;

@Controller('/accounts')
export class CreateAccountController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationsPipe(createAccountBodySchema))
  async handle(@Body() body: CreateAccountBodyBodySchema) {
    const { name, email, password } = body;

    const userAlreadyExists = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (userAlreadyExists) {
      throw new ConflictException('User already exists');
    }

    const hashPassword = await hash(password, 8);

    const newUser = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    return newUser;
  }
  @Post('/google')
  @HttpCode(201)
  @UsePipes(new ZodValidationsPipe(createGoogleAccountBodySchema))
  async handleGoogleAccountCreation(
    @Body() body: CreateGoogleAccountBodySchema
  ) {
    console.log('criando conta do google', body);
    const { name, email, googleUserId, profileImageUrl } = body;

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
      },
      select: {
        id: true,

        email: true,
      },
    });
    return newUser;
    console.log('criando conta do google', newUser);
  }
}
