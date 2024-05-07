import { InMemoryMaterialRepository } from '@/test/repositories/in-memory-material-repository';

import { CreateMaterialUseCase } from './create-material';

let inMemoryMaterialRepository: InMemoryMaterialRepository;
let sut: CreateMaterialUseCase;

describe('CreateMaterialUseCase', () => {
  beforeEach(() => {
    inMemoryMaterialRepository = new InMemoryMaterialRepository();
    sut = new CreateMaterialUseCase(inMemoryMaterialRepository);
  });

  it('should be able to create a material', async () => {
    const result = await sut.execute({
      name: 'red',
    });

    expect(result.isRight).toBeTruthy();
    expect(inMemoryMaterialRepository.items[0]).toEqual(result.value?.material);
  });
});
