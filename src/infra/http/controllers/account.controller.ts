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
} from "@nestjs/common";
import { Body, Controller, HttpCode, Post, UsePipes } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { hash } from "bcryptjs";
import { z } from "zod";
import { ZodValidationsPipe } from "src/pipes/zod-validations-pipe";
import { JwtService } from "@nestjs/jwt";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { CreateAccountUseCase } from "@/domain/auth/application/use-cases/create-account";
import { CreateGoogleAccountUseCase } from "@/domain/auth/application/use-cases/create-account-with-google";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";

const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^a-zA-Z0-9]/,
    "Password must contain at least one special character"
  );

const createAccountBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: passwordSchema,
  role: z.enum(["user", "admin"]).default("user"),
});

const createGoogleAccountBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  googleUserId: z.string(),
  profileImageUrl: z.string(),
  role: z.enum(["user", "admin"]).default("user"),
});

const updateUserBodySchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["user", "admin"]).optional(),
});

type UpdateUserBodySchema = z.infer<typeof updateUserBodySchema>;

type CreateGoogleAccountBodySchema = z.infer<
  typeof createGoogleAccountBodySchema
>;

type CreateAccountBodyBodySchema = z.infer<typeof createAccountBodySchema>;

@Controller("/accounts")
export class AccountController {
  constructor(
    private createAccountUseCase: CreateAccountUseCase,
    private createGoogleAccountUseCase: CreateGoogleAccountUseCase
    // private jwt: JwtService
  ) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationsPipe(createAccountBodySchema))
  async handle(@Body() body: CreateAccountBodyBodySchema) {
    const { name, email, password, role } = body;

    const result = await this.createAccountUseCase.execute({
      name,
      email,
      password,
      role,
    });

    if (result.isLeft()) {
      const error = result.value;
      if (error) {
        throw new ConflictException(error.message);
      }
      throw new ConflictException("An unexpected error occurred");
    }

    const { user } = result.value;

    return { user };
  }

  @Post("/google")
  @HttpCode(201)
  @UsePipes(new ZodValidationsPipe(createGoogleAccountBodySchema))
  async handleGoogleAccountCreation(@Body() body: CreateGoogleAccountBodySchema) {
    const { name, email, googleUserId, profileImageUrl, role } = body;

    const result = await this.createGoogleAccountUseCase.execute({
      name,
      email,
      googleUserId,
      profileImageUrl,
      role,
    });

    if (result.isLeft()) {
      const error = result.value;
      if (error instanceof ResourceNotFoundError) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      } else {
      return { user: result.value.user };
    }

 
  }


  // @Delete("/:id")
  // @HttpCode(204)
  // async deleteAccount(@Param("id") id: string) {
  //   const user = await this.prisma.user.findUnique({
  //     where: {
  //       id: id,
  //     },
  //   });
  //   if (!user) {
  //     throw new ConflictException("User not found");
  //   }
  //   await this.prisma.user.delete({
  //     where: {
  //       id: id,
  //     },
  //   });
  // }

  // @Post("/check")
  // async checkUserByEmail(@Body("email") email: string) {
  //   if (!email) {
  //     throw new HttpException(
  //       "Email is required in request body",
  //       HttpStatus.BAD_REQUEST
  //     );
  //   }

  //   const user = await this.prisma.user.findUnique({
  //     where: {
  //       email,
  //     },
  //   });

  //   if (user) {
  //     return true;
  //   }

  //   return false;
  // }

  // @Put("/:id")
  // @UseGuards(JwtAuthGuard)
  // @HttpCode(HttpStatus.OK)
  // async updateUser(@Param("id") id: string, @Body() body: any) {
  //   const { name, email, password, role } = body;

  //   const user = await this.prisma.user.findUnique({
  //     where: {
  //       id,
  //     },
  //   });

  //   if (!user) {
  //     throw new NotFoundException("User not found");
  //   }
  //   const updatedUserData: any = {};

  //   if (name !== undefined) updatedUserData.name = name;
  //   if (email !== undefined) updatedUserData.email = email;
  //   if (password !== undefined) {
  //     const hashPassword = await hash(password, 8);
  //     updatedUserData.password = hashPassword;
  //   }
  //   if (role !== undefined) updatedUserData.role = role;

  //   const updatedUser = await this.prisma.user.update({
  //     where: {
  //       id,
  //     },
  //     data: updatedUserData,
  //   });

  //   return updatedUser;
  // }
}
