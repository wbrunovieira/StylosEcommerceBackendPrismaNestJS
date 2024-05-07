import { EditMaterialUseCase } from './edit-material';
import { InMemoryMaterialRepository } from '@/test/repositories/in-memory-material-repository';
import { makeMaterial } from '@/test/factories/make-material';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from './errors/resource-not-found-error';

let inMemoryMaterialsRepository: InMemoryMaterialRepository;
let sut: EditMaterialUseCase;

describe('Edit Material', () => {
  beforeEach(() => {
    inMemoryMaterialsRepository = new InMemoryMaterialRepository();
    sut = new EditMaterialUseCase(inMemoryMaterialsRepository);
  });

  it('should be able to edit a material', async () => {
    const newMaterial = makeMaterial({}, new UniqueEntityID('material-1'));

    await inMemoryMaterialsRepository.create(newMaterial);

    const result = await sut.execute({
      materialId: newMaterial.id.toValue(),
      name: 'name teste',
    });

    expect(result.isRight()).toBe(true);
  });

  it('should return an error if the material does not exist', async () => {
    const result = await sut.execute({
      materialId: 'non-existing-material',
      name: 'name teste',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
