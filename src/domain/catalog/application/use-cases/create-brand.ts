
import { Brand } from '../../enterprise/entities/brand';
import { Either, right } from '@/core/either';
import { PrismaBrandRepository } from '../repositories/prisma-brand-repository';
import { Injectable } from '@nestjs/common';

interface CreateBrandUseCaseRequest {
  name: string;
}

type CreateBrandUseCaseResponse = Either<
  null,
  {
    brand: Brand;
  }
>;
@Injectable()
export class CreateBrandUseCase {
  constructor(private brandRepository: PrismaBrandRepository) {}

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
