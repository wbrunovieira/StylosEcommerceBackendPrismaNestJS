import { InMemoryProductRepository } from '@/test/repositories/in-memory-product-repository';
import { makeProduct } from '@/test/factories/make-product';
import { ListRecentProductsUseCase } from './list-recent-products';

let inMemoryProductsRepository: InMemoryProductRepository;
let sut: ListRecentProductsUseCase;

describe('List Recent Products', () => {
  beforeEach(() => {
    inMemoryProductsRepository = new InMemoryProductRepository();
    sut = new ListRecentProductsUseCase(inMemoryProductsRepository);
  });

  it('should be able to list recent products', async () => {
    await inMemoryProductsRepository.create(
      makeProduct({ createdAt: new Date(2022, 0, 20) })
    );
    await inMemoryProductsRepository.create(
      makeProduct({ createdAt: new Date(2022, 0, 18) })
    );
    await inMemoryProductsRepository.create(
      makeProduct({ createdAt: new Date(2022, 0, 23) })
    );

    const result = await sut.execute({
      page: 1,
    });

    expect(result.value?.products).toEqual([
      expect.objectContaining({ createdAt: new Date(2022, 0, 23) }),
      expect.objectContaining({ createdAt: new Date(2022, 0, 20) }),
      expect.objectContaining({ createdAt: new Date(2022, 0, 18) }),
    ]);
  });

  it('should be able to list paginated recent products', async () => {
    for (let i = 1; i <= 22; i++) {
      await inMemoryProductsRepository.create(makeProduct());
    }

    const result = await sut.execute({
      page: 2,
    });

    expect(result.value?.products).toHaveLength(2);
  });
});
