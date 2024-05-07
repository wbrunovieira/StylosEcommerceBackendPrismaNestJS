import { EditBrandUseCase } from './edit-brand';
import { InMemoryBrandRepository } from '@/test/repositories/in-memory-brand-repository';
import { makeBrand } from '@/test/factories/make-brand';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from './errors/resource-not-found-error';

let inMemoryBrandsRepository: InMemoryBrandRepository;
let sut: EditBrandUseCase;

describe('Edit Brand', () => {
  beforeEach(() => {
    inMemoryBrandsRepository = new InMemoryBrandRepository();
    sut = new EditBrandUseCase(inMemoryBrandsRepository);
  });

  it('should be able to edit a brand', async () => {
    const newBrand = makeBrand({}, new UniqueEntityID('brand-1'));

    await inMemoryBrandsRepository.create(newBrand);

    const result = await sut.execute({
      brandId: newBrand.id.toValue(),
      name: 'name teste',
    });

    expect(result.isRight()).toBe(true);
  });

  it('should return an error if the brand does not exist', async () => {
    const result = await sut.execute({
      brandId: 'non-existing-brand',
      name: 'name teste',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
