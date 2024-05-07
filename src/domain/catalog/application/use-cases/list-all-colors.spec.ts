import { InMemoryColorRepository } from '@/test/repositories/in-memory-color-repository';
import { makeColor } from '@/test/factories/make-color';
import { ListAllColorsUseCase } from './list-all-colors';

let inMemoryColorRepository: InMemoryColorRepository;
let sut: ListAllColorsUseCase;

describe('List All Colors', () => {
  beforeEach(() => {
    inMemoryColorRepository = new InMemoryColorRepository();
    sut = new ListAllColorsUseCase(inMemoryColorRepository);
  });

  it('should be able list all colors', async () => {
    await inMemoryColorRepository.create(makeColor({ name: 'Vermelho' }));
    await inMemoryColorRepository.create(makeColor({ name: 'Azul' }));
    await inMemoryColorRepository.create(makeColor({ name: 'Verde' }));

    const result = await sut.execute({
      page: 1,
    });

    expect(result.value?.colors).toEqual([
      expect.objectContaining({ name: 'Azul' }),
      expect.objectContaining({ name: 'Verde' }),
      expect.objectContaining({ name: 'Vermelho' }),
    ]);
  });

  it('should be able list the colors in pages', async () => {
    for (let i = 1; i <= 22; i++) {
      await inMemoryColorRepository.create(makeColor());
    }

    const result = await sut.execute({
      page: 2,
    });

    expect(result.value?.colors).toHaveLength(2);
  });
});
