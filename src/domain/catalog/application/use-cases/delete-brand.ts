import { Either, left, right } from '@/core/either';
import { BrandRepository } from '../repositories/brand-repository';
import { ResourceNotFoundError } from './errors/resource-not-found-error';

interface DeleteBrandUseCaseRequest {
  brandId: string;
}

type DeleteBrandUseCaseResponse = Either<ResourceNotFoundError, {}>;

export class DeleteBrandUseCase {
  constructor(private brandsRepository: BrandRepository) {}

  async execute({
    brandId,
  }: DeleteBrandUseCaseRequest): Promise<DeleteBrandUseCaseResponse> {
    const brand = await this.brandsRepository.findById(brandId);

    if (!brand) {
      return left(new ResourceNotFoundError());
    }

    await this.brandsRepository.delete(brand);

    return right({});
  }
}
