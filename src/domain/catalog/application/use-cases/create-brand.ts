import { BrandRepository } from '../repositories/brand-repository';
import { Brand } from '../../enterprise/entities/brand';
import { Either, right } from '@/core/either';

interface CreateBrandUseCaseRequest {
  name: string;
}

type CreateBrandUseCaseResponse = Either<
  null,
  {
    brand: Brand;
  }
>;

export class CreateBrandUseCase {
  constructor(private brandRepository: BrandRepository) {}

  async execute({
    name,
  }: CreateBrandUseCaseRequest): Promise<CreateBrandUseCaseResponse> {
    const brand = Brand.create({
      name,
    });

    await this.brandRepository.create(brand);

    return right({
      brand,
    });
  }
}
