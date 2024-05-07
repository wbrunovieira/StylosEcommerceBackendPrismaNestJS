import { InMemorySizeRepository } from '@/test/repositories/in-memory-size-repository';

import { CreateSizeUseCase } from './create-size';

let inMemorySizeRepository: InMemorySizeRepository;
let sut: CreateSizeUseCase;

describe('CreateSizeUseCase', () => {
  beforeEach(() => {
    inMemorySizeRepository = new InMemorySizeRepository();
    sut = new CreateSizeUseCase(inMemorySizeRepository);
  });

  it('should be able to create a size', async () => {
    const result = await sut.execute({
      name: 'red',
    });

    expect(result.isRight).toBeTruthy();
    expect(inMemorySizeRepository.items[0]).toEqual(result.value?.size);
  });
});
