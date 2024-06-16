import {
  Body,
  Controller,
  Delete,
  HttpException,
  HttpStatus,
  Param,
  Get,
  Post,
  UseGuards,
  Query,
  Put,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../../auth/jwt-auth.guard";

import { ZodValidationsPipe } from "../../../pipes/zod-validations-pipe";

import { z } from "zod";
import { CreateProductUseCase } from "@/domain/catalog/application/use-cases/create-product";
import { RolesGuard } from "@/auth/roles.guard";
import { Roles } from "@/auth/roles.decorator";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { EditProductUseCase } from "@/domain/catalog/application/use-cases/edit-product";
import { PrismaService } from "@/prisma/prisma.service";
import { GetProductBySlugUseCase } from "@/domain/catalog/application/use-cases/get-product-by-slug";
import { GetProductsByCategoryIdUseCase } from "@/domain/catalog/application/use-cases/get-all-products-by-category";
import { FindProductByNameUseCase } from "@/domain/catalog/application/use-cases/find-all-products-by-name";
import { GetProductsByBrandIdUseCase } from "@/domain/catalog/application/use-cases/get-all-products-by-brand";
import { GetProductsByColorIdUseCase } from "@/domain/catalog/application/use-cases/get-all-products-by-color";

const createProductBodySchema = z.object({
  name: z.string(),
  description: z.string(),
  productColors: z.array(z.string()).optional(),
  productSizes: z.array(z.string()).optional(),
  productCategories: z.array(z.string()),
  materialId: z.string(),
  brandId: z.string(),
  sku: z.string().optional(),
  price: z.number(),
  stock: z.number(),
  discount: z.number().optional(),
  onSale: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  images: z.array(z.string()).max(5).optional(),
  height: z.number(),
  width: z.number(),
  length: z.number(),
  weight: z.number(),
});

const bodyValidationPipe = new ZodValidationsPipe(createProductBodySchema);

type CreateProductBodySchema = z.infer<typeof createProductBodySchema>;

const pageQueryParamSchema = z
  .string()
  .optional()
  .default("1")
  .transform(Number)
  .pipe(z.number().min(1));

const editProductSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  productSizes: z.array(z.string()).optional(),
  productColors: z
    .array(z.object({ id: z.string(), name: z.string(), hex: z.string() }))
    .optional(),
  productCategories: z
    .array(z.object({ id: z.string(), name: z.string() }))
    .optional(),
  slug: z.array(z.string()).optional(),
  materialId: z.string().optional(),
  sizeId: z.array(z.string()).optional(),
  brandId: z.string().optional(),
  discount: z.number().optional(),
  price: z.number().optional(),
  stock: z.number().optional(),
  sku: z.string().optional(),
  height: z.number().optional(),
  width: z.number().optional(),
  length: z.number().optional(),
  weight: z.number().optional(),
  onSale: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  images: z.array(z.string()).optional(),
});

type EditProductBodySchema = z.infer<typeof editProductSchema>;
const queryValidationPipe = new ZodValidationsPipe(pageQueryParamSchema);

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>;

@Controller("/products")
export class ProductController {
  constructor(
    private createProductUseCase: CreateProductUseCase,
    private prisma: PrismaService,
    private editProductUseCase: EditProductUseCase,
    private getProductBySlug: GetProductBySlugUseCase,
    private getAllProductsByCategoryId: GetProductsByCategoryIdUseCase,
    private getAllProductsByBrandId: GetProductsByBrandIdUseCase,
    private getAllProductsByColorId: GetProductsByColorIdUseCase,
    private findProductByName: FindProductByNameUseCase
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  async createProduct(@Body(bodyValidationPipe) body: CreateProductBodySchema) {
    try {
      const result = await this.createProductUseCase.execute({
        name: body.name,
        description: body.description,
        productColors: body.productColors,
        productSizes: body.productSizes,
        productCategories: body.productCategories,
        materialId: body.materialId || null,
        brandId: body.brandId,
        price: body.price,
        stock: body.stock,
        sku: body.sku || "sku text",
        discount: body.discount || 0,
        onSale: body.onSale || false,
        isNew: body.isNew || false,
        isFeatured: body.isFeatured || false,
        images: body.images || [],
        height: body.height,
        width: body.width,
        length: body.length,
        weight: body.weight,
      });

      if (result.isLeft()) {
        const error = result.value;
        if (error instanceof ResourceNotFoundError) {
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
      } else {
        return { product: result.value.product };
      }
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        console.error("Error creating product:", error);
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(
        "Failed to create product",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("/search")
  async searchProducts(@Query("name") name: string) {
    console.log("name controller", name);

    if (!name) {
      throw new HttpException(
        "Query parameter 'name' is required",
        HttpStatus.BAD_REQUEST
      );
    }

    const result = await this.findProductByName.execute({ name });
    console.log("result controller", result);

    if (result.isLeft()) {
      const error = result.value;
      console.log("error controller", error);
      if (error instanceof ResourceNotFoundError) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
    }

    return { products: result.value };
  }

  @Get("/category/:categoryId")
  async allProductsByCategory(@Param("categoryId") categoryId: string) {
    try {
      const result = await this.getAllProductsByCategoryId.execute({
        categoryId,
      });

      if (result.isLeft()) {
        const error = result.value;
        if (error instanceof ResourceNotFoundError) {
          console.error(`Products not found: ${error.message}`);
          throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        } else {
          throw new HttpException(
            "An unexpected error occurred.",
            HttpStatus.INTERNAL_SERVER_ERROR
          );
        }
      } else {
        return result.value;
      }
    } catch (error) {}
  }

  @Get("/brand/:brandId")
  async allProductsByBrand(@Param("brandId") brandId: string) {
    try {
      const result = await this.getAllProductsByBrandId.execute({
        brandId,
      });

      if (result.isLeft()) {
        const error = result.value;
        if (error instanceof ResourceNotFoundError) {
          console.error(`Products not found: ${error.message}`);
          throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        } else {
          throw new HttpException(
            "An unexpected error occurred.",
            HttpStatus.INTERNAL_SERVER_ERROR
          );
        }
      } else {
        return result.value;
      }
    } catch (error) {}
  }

  @Get("/color/:colorId")
  async allProductsByColor(@Param("colorId") colorId: string) {
    try {
      const result = await this.getAllProductsByColorId.execute({
        colorId,
      });

      if (result.isLeft()) {
        const error = result.value;
        if (error instanceof ResourceNotFoundError) {
          console.error(`Products not found: ${error.message}`);
          throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        } else {
          throw new HttpException(
            "An unexpected error occurred.",
            HttpStatus.INTERNAL_SERVER_ERROR
          );
        }
      } else {
        return result.value;
      }
    } catch (error) {}
  }

  @Get("/featured-products")
  async feature() {
    const products = await this.prisma.product.findMany({
      where: {
        isFeatured: true,
      },
      include: {
        productColors: {
          include: {
            color: true,
          },
        },
        productSizes: {
          include: {
            size: true,
          },
        },
        productCategories: {
          include: {
            category: true,
          },
        },
        brand: true,
        material: true,
        productVariants: true,
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
      include: {
        productCategories: {
          include: {
            category: true,
          },
        },
      },
    });

    return { products };
  }

  @Get(":id")
  async getProduct(@Param("id") id: string) {
    console.log("id controller");
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new HttpException("Produto não encontrado", HttpStatus.NOT_FOUND);
    }
    return { product };
  }

  @Get("slug/:slug")
  async getProductbySlug(@Param("slug") slug: string) {
    try {
      console.log(`Fetching product with slug: ${slug}`);
      const result = await this.getProductBySlug.execute({ slug });

      if (result.isLeft()) {
        const error = result.value;
        if (error instanceof ResourceNotFoundError) {
          console.error(`Product not found: ${error.message}`);
          throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        } else {
          throw new HttpException(
            "An unexpected error occurred.",
            HttpStatus.INTERNAL_SERVER_ERROR
          );
        }
      } else {
        const {
          product,
          materialName,
          brandName,
          colors,
          sizes,
          categories,
          variants,
        } = result.value;

        if (!product) {
          throw new HttpException("Product not found", HttpStatus.NOT_FOUND);
        }
        return {
          product: product,
          slug: product.slug,
          materialName,
          brandName,
          colors,
          sizes,
          categories,
          variants,
        };
      }
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        console.error(`Failed to find slug: ${error.message}`);
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        "Failed to find slug",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put("save/:id")
  async saveProduct(
    @Param("id") id: string,
    @Body(new ZodValidationsPipe(editProductSchema)) body: EditProductBodySchema
  ) {
    const transformedBody = {
      ...body,
      productCategories: body.productCategories
        ? body.productCategories.map((category) =>
            typeof category === "string" ? { id: category, name: "" } : category
          )
        : undefined,
    };
    const result = await this.editProductUseCase.execute({
      productId: id,
      ...transformedBody,
    });

    if (result.isLeft()) {
      throw new HttpException(result.value.message, HttpStatus.BAD_REQUEST);
    }

    return { product: result.value.product };
  }
}
