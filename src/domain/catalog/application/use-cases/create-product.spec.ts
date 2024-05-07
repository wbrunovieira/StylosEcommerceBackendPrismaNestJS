import { InMemoryProductColorRepository } from '@/test/repositories/in-memory-product-color-repository';
import { ProductRepository } from '../repositories/product-repository';
import { CreateProductUseCase } from './create-product';
import { InMemoryProductRepository } from '@/test/repositories/in-memory-product-repository';
import { ProductColorRepository } from '../repositories/product-color-repository';
import { InMemoryColorRepository } from '@/test/repositories/in-memory-color-repository';
import { ColorRepository } from '../repositories/color-repository';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { makeColor } from '@/test/factories/make-color';
import { SizeRepository } from '../repositories/size-repository';
import { InMemorySizeRepository } from '@/test/repositories/in-memory-size-repository';
import { ProductSizeRepository } from '../repositories/product-size-repository';
import { InMemoryProductSizeRepository } from '@/test/repositories/in-memory-product-size-repository';
import { InMemoryBrandRepository } from '@/test/repositories/in-memory-brand-repository';
import { makeSize } from '@/test/factories/make-size';

describe('CreateProductUseCase', () => {
  let inMemoryProductRepository: ProductRepository;
  let inMemoryProductColorRepository: ProductColorRepository;
  let inMemoryProductSizeRepository: ProductSizeRepository;
  let inMemoryColorRepository: ColorRepository;
  let inMemorySizeRepository: SizeRepository;
  let inMemoryBrandRepository: InMemoryBrandRepository;

  let sut: CreateProductUseCase;
  beforeEach(() => {
    inMemoryProductRepository = new InMemoryProductRepository();
    inMemoryProductColorRepository = new InMemoryProductColorRepository();
    inMemoryProductSizeRepository = new InMemoryProductSizeRepository();
    inMemoryColorRepository = new InMemoryColorRepository();
    inMemorySizeRepository = new InMemorySizeRepository();
    inMemoryBrandRepository = new InMemoryBrandRepository();

    const color1 = makeColor({ name: 'Cor 1' }, new UniqueEntityID('1'));
    const color2 = makeColor({ name: 'Cor 2' }, new UniqueEntityID('2'));

    const size1 = makeSize({ name: 'Small' }, new UniqueEntityID('3'));
    const size2 = makeSize({ name: 'Medium' }, new UniqueEntityID('4'));

    inMemoryColorRepository.create(color1);
    inMemoryColorRepository.create(color2);

    inMemorySizeRepository.create(size1);
    inMemorySizeRepository.create(size2);

    sut = new CreateProductUseCase(
      inMemoryProductRepository,
      inMemoryProductColorRepository,
      inMemoryColorRepository,
      inMemorySizeRepository,
      inMemoryProductSizeRepository,
      inMemoryBrandRepository
    );
  });

  it('should be able to create a product without colors and sizes', async () => {
    const result = await sut.execute({
      name: 'name',
      description: 'description',
      colorIds: [],
      sizeIds: [],
      materialId: '1',
      brandID: '1',
      price: 100,
      stock: 1,
    });

    expect(result.isRight()).toBeTruthy();
    expect(
      (inMemoryProductRepository as InMemoryProductRepository).items
    ).toHaveLength(1);
    expect(
      (inMemoryProductRepository as InMemoryProductRepository).items
    ).toHaveLength(1);
  });

  it('should be able to create a product with colors and sizes', async () => {
    const result = await sut.execute({
      name: 'name',
      description: 'description',
      colorIds: ['1', '2'],
      sizeIds: ['3', '4'],
      materialId: '1',
      brandID: '1',
      price: 100,
      stock: 1,
    });

    console.log('result ', result);

    expect(result.isRight()).toBeTruthy();
    expect(
      (inMemoryProductRepository as InMemoryProductRepository).items
    ).toHaveLength(1);

    const createdProduct = (
      inMemoryProductRepository as InMemoryProductRepository
    ).items[0];
    const productColors = await inMemoryProductColorRepository.findByProductId(
      createdProduct.id.toString()
    );
    const productSizes = await inMemoryProductSizeRepository.findByProductId(
      createdProduct.id.toString()
    );
    console.log('productColors ', productColors);

    expect(productColors).toHaveLength(2);
    expect(
      productColors.some((pc) => pc.colorId.toString() === '1')
    ).toBeTruthy();
    expect(
      productColors.some((pc) => pc.colorId.toString() === '2')
    ).toBeTruthy();
    expect(productSizes).toHaveLength(2);
    expect(
      productSizes.some((ps) => ps.sizeId.toString() === '3')
    ).toBeTruthy();
  });
});
