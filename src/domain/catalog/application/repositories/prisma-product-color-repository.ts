import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../prisma/prisma.service";
import { IProductColorRepository } from "./i-product-color-repository";
import { Either, left, right } from "@/core/either";

@Injectable()
export class PrismaProductColorRepository implements IProductColorRepository {
  constructor(private prisma: PrismaService) {}

  async create(productId: string, colorId: string): Promise<Either<Error, void>>  {
   
    try {

     const colorExists = await this.prisma.color.findUnique({
        where: { id: colorId },
      });
      if (!colorExists) {
        throw new Error("Color not found");
      }
  
      const productExists = await this.prisma.product.findUnique({
        where: { id: productId} 
      })
      if (!productExists) {
        throw new Error("Product not found");
      }
      await this.prisma.productColor.create({
        data: {
          productId,
          colorId
         
        },
      });
      await this.prisma.productColor.create({
        data: { productId, colorId },
      });
      
      return right(undefined);
    } catch (error) {
      return left(new Error("Failed to create product color"));
    }

     
   
  }

  
}
