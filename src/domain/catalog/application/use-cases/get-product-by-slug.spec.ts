import { InMemoryProductRepository } from '@/test/repositories/in-memory-product-repository';

import { Slug } from '../../enterprise/entities/value-objects/slug';
import { GetProductBySlugUseCase } from './get-product-by-slug';
import { makeProduct } from '@/test/factories/make-product';
import { ResourceNotFoundError } from './errors/resource-not-found-error';

let inMemoryProductRepository: InMemoryProductRepository;
let sut: GetProductBySlugUseCase;

describe('Get Question By Slug', () => {
  beforeEach(() => {
    inMemoryProductRepository = new InMemoryProductRepository();
    sut = new GetProductBySlugUseCase(inMemoryProductRepository);
  });

  it('should be able to get a question by slug', async () => {
    const newProduct = makeProduct({
      slug: Slug.create('example-product'),
    });
    await inMemoryProductRepository.create(newProduct);

    const result = await sut.execute({
      slug: 'example-product',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.product.name).toEqual(newProduct.name);
    }
  });

  it('should return a Left with ResourceNotFoundError if the product does not exist', async () => {
    const slug = 'non-existent-product';
    const result = await sut.execute({ slug });

    expect(result.isLeft()).toBe(true);

    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    }
  });
});
