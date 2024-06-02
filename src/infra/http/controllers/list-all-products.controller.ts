import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { ZodValidationsPipe } from "../../../pipes/zod-validations-pipe";
import { PrismaService } from "src/prisma/prisma.service";
import { z } from "zod";

const pageQueryParamSchema = z
  .string()
  .optional()
  .default("1")
  .transform(Number)
  .pipe(z.number().min(1));

const queryValidationPipe = new ZodValidationsPipe(pageQueryParamSchema);

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>;

@Controller("/products")
export class ListAllProductsController {
  constructor(private prisma: PrismaService) {}

  @Get("/featured-products")
  async feature() {
    const products = await this.prisma.product.findMany({
      where: {
        isFeatured: true,
      },
      take: 9,
      orderBy: {
        createdAt: "desc",
      },
    });

    return { products };
  }

  @Get("all")
  async handle(@Query("page", queryValidationPipe) page: PageQueryParamSchema) {
    const perPage = 10;

    const products = await this.prisma.product.findMany({
      take: perPage,
      skip: (page - 1) * perPage,
      orderBy: {
        name: "asc",
      },
    });

    return { products };
  }

  @Get(":id")
  async getProduct(@Param("id") id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new HttpException("Produto não encontrado", HttpStatus.NOT_FOUND);
    }
    return { product };
  }

  @Get("slug/:slug")
  async getProductbySlug(@Param("slug") slug: string) {
    const product = await this.prisma.product.findUnique({ where: { slug } });
    if (!product) {
      throw new HttpException("Produto não encontrado", HttpStatus.NOT_FOUND);
    }
    return { product };
  }
}
