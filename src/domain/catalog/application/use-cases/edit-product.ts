import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ProductRepository } from '../repositories/product-repository';
import { Slug } from '../../enterprise/entities/value-objects/slug';
import { Product } from '../../enterprise/entities/product';
import { ProductColor } from '../../enterprise/entities/product-color';
import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from './errors/resource-not-found-error';
import { ProductColorRepository } from '../repositories/product-color-repository';
import { ColorRepository } from '../repositories/color-repository';

interface EditProductUseCaseRequest {
  productId: string;
  name: string;
  description: string;
  colorIds: string[];
  sizeId: UniqueEntityID[];
  materialId: UniqueEntityID;
  brandID: UniqueEntityID;
  price: number;
  stock: number;
  slug: string;
}

type EditProductUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    product: Product;
  }
>;
export class EditProductUseCase {
  constructor(
    private productsRepository: ProductRepository,
    private productColorRepository: ProductColorRepository,
    private colorRepository: ColorRepository
  ) {}

  async execute({
    productId,
    name,
    description,
    colorIds,
    sizeId,
    materialId,
    brandID,
    price,
    stock,
    slug,
  }: EditProductUseCaseRequest): Promise<EditProductUseCaseResponse> {
    const product = await this.productsRepository.findById(productId);

    if (!product) {
      return left(new ResourceNotFoundError());
    }

    product.name = name;
    product.description = description;

    product.sizeId = sizeId;
    product.materialId = materialId;
    product.brandId = brandID;
    product.price = price;
    product.stock = stock;
    product.slug = Slug.createFromText(slug);
    slug: Slug.createFromText('name-teste'),
      await this.productsRepository.save(product);
    await this.productColorRepository.deleteAllByProductId(productId);

    for (const colorId of colorIds) {
      const colorExists = await this.colorRepository.findById(colorId);
      if (colorExists) {
        const productColor = new ProductColor({
          productId: product.id,
          colorId: new UniqueEntityID(colorId),
        });

        await this.productColorRepository.create(productColor);
      } else {
        return left(new ResourceNotFoundError());
      }
    }

    return right({
      product,
    });
  }
}
