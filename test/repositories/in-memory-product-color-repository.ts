import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Either, left, right } from "@/core/either";
import { IProductColorRepository } from "@/domain/catalog/application/repositories/i-product-color-repository";
import { ProductColor } from "@/domain/catalog/enterprise/entities/product-color";
import { InMemoryColorRepository } from "./in-memory-color-repository";
import { InMemoryProductRepository } from "./in-memory-product-repository";

export class InMemoryProductColorRepository implements IProductColorRepository {
  public items: ProductColor[] = [];
  private colorRepository: InMemoryColorRepository;
  private productRepository: InMemoryProductRepository;

  constructor(
    colorRepository: InMemoryColorRepository,
    productRepository: InMemoryProductRepository
  ) {
    this.colorRepository = colorRepository;
    this.productRepository = productRepository;
  }

  async create(
    productId: string,
    colorId: string
  ): Promise<Either<Error, void>> {
    console.log("entrou no inmemory product color");
    const colorExists = await this.colorRepository.findById(colorId);
    console.log("colorExists", colorExists);

    if (!colorExists.isLeft()) {
      return left(new Error("Color not found"));
    }

    const productExists = await this.productRepository.findById(productId);

    console.log("productExists", productExists);

    if (!productExists.isLeft()) {
      return left(new Error("Product not found"));
    }

    const productIdUnique = new UniqueEntityID(productId.toString());
    const colorIdUnique = new UniqueEntityID(colorId.toString());

    const now = new Date();

    const productColor = new ProductColor({
      productId: productIdUnique,
      colorId: colorIdUnique,
      createdAt: now,
      updatedAt: now,
    });

    this.items.push(productColor);
    return right(undefined);
  }

  async findByProductId(productId: string): Promise<ProductColor[]> {
    return this.items.filter((item) => item.productId.toString() === productId);
  }

  async findByColorId(colorId: string): Promise<ProductColor[]> {
    return this.items.filter((item) => item.colorId.toString() === colorId);
  }

  async addItem(productColor: ProductColor): Promise<void> {
    this.items.push(productColor);
  }

  async delete(productColor: ProductColor): Promise<void> {
    this.items = this.items.filter(
      (item) =>
        item.productId.toString() !== productColor.productId.toString() ||
        item.colorId.toString() !== productColor.colorId.toString()
    );
  }

  async deleteAllByProductId(productId: string): Promise<void> {
    this.items = this.items.filter(
      (item) => item.productId.toString() !== productId
    );
  }
}
