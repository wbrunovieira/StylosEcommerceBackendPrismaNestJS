import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { InMemoryMaterialRepository } from '@/test/repositories/in-memory-material-repository';
import { DeleteMaterialUseCase } from './delete-material';

import { makeMaterial } from '@/test/factories/make-material';
import { ResourceNotFoundError } from './errors/resource-not-found-error';

let inMemoryMaterialRepository: InMemoryMaterialRepository;
let sut: DeleteMaterialUseCase;

describe('Delete Material', () => {
  beforeEach(() => {
    inMemoryMaterialRepository = new InMemoryMaterialRepository();
    sut = new DeleteMaterialUseCase(inMemoryMaterialRepository);
  });

  it('should be able to delete a material', async () => {
    const newMaterial = makeMaterial({}, new UniqueEntityID('material-1'));

    await inMemoryMaterialRepository.create(newMaterial);

    const result = await sut.execute({
      materialId: 'material-1',
    });

    expect(result.isRight()).toBe(true);
  });

  it('should return an error if the material does not exist', async () => {
    const result = await sut.execute({
      materialId: 'non-existing-material',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
