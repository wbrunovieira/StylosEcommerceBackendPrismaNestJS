
import { Color } from '../../enterprise/entities/color';
import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from './errors/resource-not-found-error';
import { PrismaColorRepository } from '../repositories/prisma-color-repository';
import { Injectable } from '@nestjs/common';

interface EditColorUseCaseRequest {
  colorId: string;
  name: string;
}

type EditColorUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    color: Color;
  }
>;
@Injectable()
export class EditColorUseCase {
  constructor(private colorsRepository: PrismaColorRepository) {}

  async execute({
    colorId,
    name,
  }: EditColorUseCaseRequest): Promise<EditColorUseCaseResponse> {
    const color = await this.colorsRepository.findById(colorId);

    if (!color) {
      return left(new ResourceNotFoundError());
    }

    color.name = name;

    await this.colorsRepository.save(color);

    return right({
      color,
    });
  }
}
