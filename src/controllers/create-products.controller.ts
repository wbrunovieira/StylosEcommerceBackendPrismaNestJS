import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user-decorator';
import { UserPayload } from 'src/auth/jwt.strategy';

import { ZodValidationsPipe } from '../pipes/zod-validations-pipe';
import { PrismaService } from 'src/prisma/prisma.service';
import { z } from 'zod';

const createProductBodySchema = z.object({
  name: z.string(),
  description: z.string(),
  color: z.string(),
  size: z.string(),
  material: z.string(),
  brand: z.string(),
  price: z.string(),
  stock: z.string(),
});

const bodyValidationPipe = new ZodValidationsPipe(createProductBodySchema);

type CreateProductBodySchema = z.infer<typeof createProductBodySchema>;

@Controller('/products')
@UseGuards(JwtAuthGuard)
export class CreateProductController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async handle(
    @Body(bodyValidationPipe) body: CreateProductBodySchema,
    @CurrentUser() user: UserPayload
  ) {
    const { name, description, color, size, material, brand, price, stock } =
      body;
    const userId = user.sub;

    await this.prisma.product.create({
      data: {
        name,
        description,
        color,
        size,
        material,
        brand,
        price,
        stock: Number(stock),
      },
    });
  }

  @Get()
  async show() {
    return await this.prisma.product.findMany();
  }
}
