import { Either, left, right } from '@/core/either';

import { ResourceNotFoundError } from './errors/resource-not-found-error';
import { PrismaBrandRepository } from '../repositories/prisma-brand-repository';
import { Injectable } from '@nestjs/common';

interface DeleteBrandUseCaseRequest {
  brandId: string;
}

type DeleteBrandUseCaseResponse = Either<ResourceNotFoundError, {}>;

@Injectable()
export class DeleteBrandUseCase {
  constructor(private brandsRepository: PrismaBrandRepository) {}

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
