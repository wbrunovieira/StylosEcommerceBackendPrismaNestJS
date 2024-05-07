import { InMemoryColorRepository } from '@/test/repositories/in-memory-color-repository';

import { CreateColorUseCase } from './create-color';

let inMemoryColorRepository: InMemoryColorRepository;
let sut: CreateColorUseCase;

describe('CreateColorUseCase', () => {
  beforeEach(() => {
    inMemoryColorRepository = new InMemoryColorRepository();
    sut = new CreateColorUseCase(inMemoryColorRepository);
  });

  it('should be able to create a color', async () => {
    const result = await sut.execute({
      name: 'red',
    });

    expect(result.isRight).toBeTruthy();
    expect(inMemoryColorRepository.items[0]).toEqual(result.value?.color);
  });
});
