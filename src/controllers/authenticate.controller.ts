import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { z } from 'zod';
import { ZodValidationsPipe } from '../pipes/zod-validations-pipe';
import { PrismaService } from '../prisma/prisma.service';
import { emit } from 'process';
import { compare } from 'bcryptjs';

const autheticateBodySchema = z.object({
  email: z.string(),
  password: z.string(),
});

type AuthenticateBodySchema = z.infer<typeof autheticateBodySchema>;
@Controller('/sessions')
export class AuthenticateController {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService
  ) {}

  @Post()
  @UsePipes(new ZodValidationsPipe(autheticateBodySchema))
  async handle(@Body() body: AuthenticateBodySchema) {
    const { email, password } = body;

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        name: true,
        profileImageUrl: true,
        email: true,
        password: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const accessToken = this.jwt.sign({ sub: user.id });
    const { password: _, ...userWithoutPassword } = user;
    console.log(userWithoutPassword);

    return {
      access_token: accessToken,
      user: userWithoutPassword,
    };
  }
}
