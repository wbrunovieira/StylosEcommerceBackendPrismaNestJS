import { Either, left, right } from '@/core/either';

import { ResourceNotFoundError } from './errors/resource-not-found-error';
import { Injectable } from '@nestjs/common';
import { PrismaColorRepository } from '../repositories/prisma-color-repository';

interface DeleteColorUseCaseRequest {
  colorId: string;
}

type DeleteColorUseCaseResponse = Either<ResourceNotFoundError, {}>;

@Injectable()
export class DeleteColorUseCase {
  constructor(private colorsRepository: PrismaColorRepository) {}

  async execute({
    colorId,
  }: DeleteColorUseCaseRequest): Promise<DeleteColorUseCaseResponse> {
    const color = await this.colorsRepository.findById(colorId);

    if (!color) {
      return left(new ResourceNotFoundError());
    }

    await this.colorsRepository.delete(color);

    return right({});
  }
}
