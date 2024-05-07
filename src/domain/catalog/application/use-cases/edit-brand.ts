import { BrandRepository } from '../repositories/brand-repository';
import { Brand } from '../../enterprise/entities/brand';
import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from './errors/resource-not-found-error';

interface EditBrandUseCaseRequest {
  brandId: string;
  name: string;
}

type EditBrandUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    brand: Brand;
  }
>;

export class EditBrandUseCase {
  constructor(private brandsRepository: BrandRepository) {}

  async execute({
    brandId,
    name,
  }: EditBrandUseCaseRequest): Promise<EditBrandUseCaseResponse> {
    const brand = await this.brandsRepository.findById(brandId);

    if (!brand) {
      return left(new ResourceNotFoundError());
    }

    brand.name = name;

    await this.brandsRepository.save(brand);

    return right({
      brand,
    });
  }
}
