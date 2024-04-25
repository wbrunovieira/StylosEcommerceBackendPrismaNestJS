import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user-decorator';
import { UserPayload } from 'src/auth/jwt.strategy';

import { ZodValidationsPipe } from '../pipes/zod-validations-pipe';
import { PrismaService } from 'src/prisma/prisma.service';
import { z } from 'zod';

const createProductBodySchema = z.object({
  name: z.string(),
  description: z.string(),
  color: z.string().optional(),
  size: z.string().optional(),
  images: z.array(z.string()).max(5).optional(),
  material: z.string().optional(),
  brand: z.string(),
  price: z.number(),
  stock: z.number(),
  discount: z.number().optional(),
  OnSale: z.boolean().optional(),
  IsNew: z.boolean().optional(),
  IsFeatured: z.boolean().optional(),
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
    const {
      name,
      description,
      color,
      size,
      material,
      brand,
      price,
      stock,
      images,
      discount,
      OnSale,
      IsNew,
      IsFeatured,
    } = body;
    const userId = user.sub;

    const priceAsFloat = parseFloat(price.toString());

    await this.prisma.product.create({
      data: {
        name,
        description,
        images,
        color,
        size,
        material,
        brand,
        price: priceAsFloat,
        stock: Number(stock),
        discount: discount ? parseFloat(discount.toString()) : undefined,
        onSale: OnSale ? true : false,
        isNew: IsNew ? true : false,
        isFeatured: IsFeatured ? true : false,
        FinalPrice: 0,
      },
    });
  }
}
