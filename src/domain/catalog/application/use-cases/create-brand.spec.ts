import { InMemoryBrandRepository } from '@/test/repositories/in-memory-brand-repository';

import { CreateBrandUseCase } from './create-brand';

let inMemoryBrandRepository: InMemoryBrandRepository;
let sut: CreateBrandUseCase;

describe('CreateBrandUseCase', () => {
  beforeEach(() => {
    inMemoryBrandRepository = new InMemoryBrandRepository();
    sut = new CreateBrandUseCase(inMemoryBrandRepository);
  });

  it('should be able to create a brand', async () => {
    const result = await sut.execute({
      name: 'red',
    });

    expect(result.isRight).toBeTruthy();
    expect(inMemoryBrandRepository.items[0]).toEqual(result.value?.brand);
  });
});
