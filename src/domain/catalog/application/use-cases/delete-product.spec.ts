import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { InMemoryProductRepository } from '@/test/repositories/in-memory-product-repository';
import { DeleteProductUseCase } from './delete-product';

import { makeProduct } from '@/test/factories/make-product';
import { ResourceNotFoundError } from './errors/resource-not-found-error';
import { InMemoryProductColorRepository } from '@/test/repositories/in-memory-product-color-repository';
import { ProductColor } from '../../enterprise/entities/product-color';

let inMemoryProductRepository: InMemoryProductRepository;
let inMemoryProductColorRepository: InMemoryProductColorRepository;
let sut: DeleteProductUseCase;

describe('Delete Product', () => {
  beforeEach(() => {
    inMemoryProductRepository = new InMemoryProductRepository();
    inMemoryProductColorRepository = new InMemoryProductColorRepository();
    sut = new DeleteProductUseCase(
      inMemoryProductRepository,
      inMemoryProductColorRepository
    );
  });

  it('should be able to delete a product', async () => {
    const newProduct = makeProduct({}, new UniqueEntityID('product-1'));

    await inMemoryProductRepository.create(newProduct);

    await inMemoryProductColorRepository.create(
      new ProductColor({
        productId: new UniqueEntityID('product-1'),
        colorId: new UniqueEntityID('color-1'),
      })
    );
    await inMemoryProductColorRepository.create(
      new ProductColor({
        productId: new UniqueEntityID('product-1'),
        colorId: new UniqueEntityID('color-2'),
      })
    );

    // Confirma a existência do produto e suas relações antes da deleção
    expect(
      await inMemoryProductRepository.findById('product-1')
    ).not.toBeNull();
    expect(
      await inMemoryProductColorRepository.findByProductId('product-1')
    ).toHaveLength(2);

    const result = await sut.execute({
      productId: 'product-1',
    });

    expect(result.isRight()).toBe(true);
    expect(await inMemoryProductRepository.findById('product-1')).toBeNull();
    expect(
      await inMemoryProductColorRepository.findByProductId('product-1')
    ).toHaveLength(0);
  });

  it('should return an error if the product does not exist', async () => {
    const result = await sut.execute({
      productId: 'non-existing-product',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
