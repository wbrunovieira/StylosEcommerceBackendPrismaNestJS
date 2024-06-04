import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../prisma/prisma.service";
import { IProductRepository } from "../../../../domain/catalog/application/repositories/i-product-repository";
import { Product } from "../../../../domain/catalog/enterprise/entities/product";

import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

@Injectable()
export class PrismaProductRepository implements IProductRepository {
  constructor(private prisma: PrismaService) {}

  async findBySlug(slug: string): Promise<Either<Error, Product>> {
    try {
      console.log(`Querying database for product with slug: ${slug}`);
      const productData = await this.prisma.product.findUnique({
        where: { slug: slug },
        include: {
          productColors: true,
          productSizes: true,
          productCategories: true,
          brand: true,
          material: true,
          productVariants: true,
        },
      });

    console.log('PRODUCT IN PRISMA PRODUCT', productData)
    
      if (!productData) {
        console.error(`Product not found: ${slug}`); // Log de erro
        return left(new ResourceNotFoundError(`Product not found: ${slug}`));
      }
      const product = Product.create(
        {
          name: productData.name,
          description: productData.description,
          productSizes: productData.productSizes.map(
            (size) => new UniqueEntityID(size.sizeId)
          ),
          productColors: productData.productColors.map(
            (color) => new UniqueEntityID(color.colorId)
          ),
          productCategories: productData.productCategories.map(
            (category) => new UniqueEntityID(category.categoryId)
          ),
          materialId: productData.materialId
            ? new UniqueEntityID(productData.materialId)
            : undefined,
          sizeId: productData.productSizes.map(
            (size) => new UniqueEntityID(size.sizeId)
          ),
          finalPrice: productData.finalPrice ?? undefined,
          brandId: new UniqueEntityID(productData.brandId),

          discount: productData.discount ?? undefined,
          price: productData.price,
          stock: productData.stock,
          sku: productData.sku ?? "ntt",
          height: productData.height ?? undefined,
          width: productData.width ?? undefined,
          length: productData.length ?? undefined,
          weight: productData.weight ?? undefined,
          onSale: productData.onSale ?? undefined,
          isFeatured: productData.isFeatured ?? undefined,
          isNew: productData.isNew ?? undefined,
          images: productData.images ?? undefined,
          createdAt: new Date(productData.createdAt),
          updatedAt: productData.updatedAt
            ? new Date(productData.updatedAt)
            : undefined,
        },
        new UniqueEntityID(productData.id)
      );
      return right(product);
    } catch (error) {
      console.error(`Failed to retrieve product: ${slug}, Error: ${error}`);
      return left(
        new ResourceNotFoundError(`Failed to retrieve product: ${slug}`)
      );
    }
  }

  async findById(productId: string): Promise<Either<Error, Product>> {
    try {
      const productData = await this.prisma.product.findUnique({
        where: { id: productId },
        include: {
          productColors: true,
          productSizes: true,
          productCategories: true,
          brand: true,
          material: true,
        },
      });

      if (!productData) {
        return left(
          new ResourceNotFoundError(`Product not found: ${productId}`)
        );
      }
      const product = Product.create(
        {
          name: productData.name,
          description: productData.description,
          productSizes: productData.productSizes.map(
            (size) => new UniqueEntityID(size.sizeId)
          ),
          productColors: productData.productColors.map(
            (color) => new UniqueEntityID(color.colorId)
          ),
          productCategories: productData.productCategories.map(
            (category) => new UniqueEntityID(category.categoryId)
          ),
          materialId: productData.materialId
            ? new UniqueEntityID(productData.materialId)
            : undefined,
          sizeId: productData.productSizes.map(
            (size) => new UniqueEntityID(size.sizeId)
          ),
          finalPrice: productData.finalPrice ?? undefined,
          brandId: new UniqueEntityID(productData.brandId),
          discount: productData.discount ?? undefined,
          price: productData.price,
          stock: productData.stock,
          sku: productData.sku ?? "ntt",
          height: productData.height ?? undefined,
          width: productData.width ?? undefined,
          length: productData.length ?? undefined,
          weight: productData.weight ?? undefined,
          onSale: productData.onSale ?? undefined,
          isFeatured: productData.isFeatured ?? undefined,
          isNew: productData.isNew ?? undefined,
          images: productData.images ?? undefined,
          createdAt: new Date(productData.createdAt),
          updatedAt: productData.updatedAt
            ? new Date(productData.updatedAt)
            : undefined,
        },
        new UniqueEntityID(productData.id)
      );
      return right(product);
    } catch (error) {
      return left(
        new ResourceNotFoundError(`Failed to retrieve product: ${productId}`)
      );
    }
  }

  async create(product: Product): Promise<Either<Error, void>> {
    try {
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
        images,
        createdAt,
        updatedAt,
        slug,
        finalPrice,
        ...otherProps
      } = {
        productColors: product.productColors,
        productSizes: product.productSizes,
        productCategories: product.productCategories,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        materialId: product.materialId ? product.materialId.toString() : null,
        brandId: product.brandId.toString(),
        images: product.images,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        slug: product.slug.toString(),
        finalPrice: product.finalPrice,
      };

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
          select: { id: true, name: true },
        });
        if (!brandExist) {
          throw new Error("Brand not found.");
        }
      }

      if (!brandExist || !brandExist.id) {
        throw new Error("Brand ID is not valid");
      }

      const createdProduct = await this.prisma.product.create({
        data: {
          id: product.id.toString(),
          name: name,
          images: images,
          description: description,
          createdAt: createdAt,
          updatedAt: updatedAt,
          slug: slug,
          price: price,
          stock: stock,
          height: product.height,
          width: product.width,
          length: product.length,
          weight: product.weight,
          material: materialExist
            ? { connect: { id: materialExist.id } }
            : undefined,
          brand: { connect: { id: brandExist.id } },
          finalPrice: finalPrice ?? undefined,
          ...otherProps,
        },
      });

      return right(undefined);
    } catch (error) {
      return left(new Error("Failed to create material"));
    }
  }

  async save(product: Product): Promise<Either<Error, void>> {
    try {
      const {
        name,
        description,
        price,
        stock,
        materialId,
        brandId,
        width,
        images,
        createdAt,
        updatedAt,
        slug,
        ...otherProps
      } = {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        materialId: product.materialId
          ? product.materialId.toString()
          : undefined,
        brandId: product.brandId.toString(),
        images: product.images,
        width: product.width,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        slug: product.slug.toString(),
        finalPrice: product.finalPrice,
      };

      await this.prisma.product.update({
        where: { id: product.id.toString() },
        data: {
          name,
          description,
          price,
          stock,
          materialId: materialId ?? undefined,
          brandId,
          images,
          createdAt,
          updatedAt,
          slug,
          ...otherProps,
        },
      });

      return right(undefined);
    } catch (error) {
      return left(new Error("Failed to update product"));
    }
  }

  async delete(product: Product): Promise<void> {
    await this.prisma.product.delete({
      where: { id: product.id.toString() },
    });
  }
}
