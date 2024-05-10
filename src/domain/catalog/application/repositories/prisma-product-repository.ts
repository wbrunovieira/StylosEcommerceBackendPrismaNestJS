import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../prisma/prisma.service";
import { IProductRepository } from "./product-repository";
import { Product } from "../../enterprise/entities/product";

import { PrismaProductColorRepository } from "./prisma-product-color-repository";

import { PrismaProductSizeRepository } from "./prisma-product-size-repository";
import { PrismaProductCategoryRepository } from "./prisma-product-category-repository";
import { generateSlug } from "../utils/generate-slug";
import { Slug } from "../../enterprise/entities/value-objects/slug";



@Injectable()
export class PrismaProductRepository implements IProductRepository {
  constructor(
    private prisma: PrismaService,
    private productColorRepository: PrismaProductColorRepository,
    private productSizeRepository: PrismaProductSizeRepository,
    private productCategoryRepository: PrismaProductCategoryRepository
  ) {}

  async create(product: Product): Promise<void> {
    const {
      productColors,
      productSizes,
      productCategories,
      name,
      description,
      price,
      stock,
      materialId,
      brandId,
      ...otherProps
    } = product;

    const validColors: { id: string }[] = [];
    const validSizes: { id: string }[] = [];
    const validCategories: { id: string }[] = [];

    if (productColors) {
      for (const colorId of productColors) {
        const idAsString = colorId.toString();
        const colorExists = await this.prisma.color.findUnique({
          where: { id: idAsString },
        });
        if (colorExists) {
          validColors.push({ id: idAsString });
        }
      }
    }

    if (productSizes) {
      for (const sizeId of productSizes) {
        const idAsString = sizeId.toString();
        const sizeExist = await this.prisma.size.findUnique({
          where: { id: idAsString },
        });
        if (sizeExist) {
          validSizes.push({ id: idAsString });
        }
      }
    }
    if (productCategories) {
      for (const categoryId of productCategories) {
        const idAsString = categoryId.toString();
        const categoryExist = await this.prisma.category.findUnique({
          where: { id: idAsString },
        });
        if (categoryExist) {
          validCategories.push({ id: idAsString });
        }
      }
    }

    let materialExist;
    if (materialId) {
      const materialIDAsString = materialId.toString();
      materialExist = await this.prisma.material.findUnique({
        where: { id: materialIDAsString },
      });
      if (!materialExist) {
        throw new Error("Material not found.");
      }
    }

    let brandExist;
    if (brandId) {
      const brandIDAsString = brandId.toString();
      brandExist = await this.prisma.brand.findUnique({
        where: { id: brandIDAsString },
        select: { name: true },
      });
      if (!brandExist) {
        throw new Error("Brand not found.");
      }
    }

    const slug = generateSlug(name, brandExist.name).toString();

    const createdProduct = await this.prisma.product.create({
      data: {
        name,
        description,
        slug,
        price,
        stock,
        ...otherProps,
        material: materialExist
          ? { connect: { id: materialExist.id } }
          : undefined,
        brand: brandExist ? { connect: { id: brandExist.id } } : undefined,
      },
    });

    for (const validColor of validColors) {
      await this.productColorRepository.create(
        createdProduct.id,
        validColor.id
      );
    }

    for (const validSize of validSizes) {
      await this.productSizeRepository.create(createdProduct.id, validSize.id);
    }

    for (const validCategory of validCategories) {
      await this.productCategoryRepository.create(
        createdProduct.id,
        validCategory.id
      );
    }
  }

  //   async findById(id: string): Promise<Product | null> {
  //     const record = await this.prisma.product.findUnique({
  //       where: { id },
  //       include: {
  //         colors: { include: { color: true } },
  //         products: { include: { size: true } },
  //         categories: { include: { category: true } },
  //         material: true,
  //         brand: true,
  //       },
  //     });
  //     if (record) {
  //       const productData = {
  //         ...record,
  //       };
  //       return Product.fromPersistence(
  //         {
  //           ...record,
  //           brandID: record.brandId,
  //           materialId: record.materialId,
  //           updatedAt: record.updatedAt ?? undefined,
  //           createdAt: record.createdAt ?? undefined,
  //         },
  //         new UniqueEntityID(record.id)
  //       );
  //     }
  //     return null;
  //   }

  //   async findManyRecent(params: PaginationParams): Promise<Product[]> {
  //     const { page = 1, pageSize = 10 } = params;
  //     const skip = (page - 1) * pageSize;
  //     const take = pageSize;

  //     const records = await this.prisma.product.findMany({
  //       skip,
  //       take,
  //       orderBy: { createdAt: "desc" },
  //       include: {
  //         colors: { include: { color: true } },
  //         products: { include: { size: true } },
  //         categories: { include: { category: true } },
  //         material: true,
  //         brand: true,
  //       },
  //     });
  //     return records.map(
  //       (record) => new Product(record, new UniqueEntityID(record.id))
  //     );
  //   }

  //   async findBySlug(slug: string): Promise<Product | null> {
  //     const record = await this.prisma.product.findUnique({
  //       where: { slug },
  //       include: {
  //         colors: { include: { color: true } },
  //         products: { include: { size: true } },
  //         categories: { include: { category: true } },
  //         material: true,
  //         brand: true,
  //       },
  //     });
  //     return record ? new Product(record, new UniqueEntityID(record.id)) : null;
  //   }

  //   async delete(product: Product): Promise<void> {
  //     await this.prisma.product.delete({
  //       where: { id: product.id.toString() },
  //     });
  //   }

  //   async save(product: Product): Promise<void> {
  //     // Save (or update) logic including handling relations as discussed earlier
  //   }
}
