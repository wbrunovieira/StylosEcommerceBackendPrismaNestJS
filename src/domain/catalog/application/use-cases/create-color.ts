import { ColorRepository } from '../repositories/color-repository';
import { Color } from '../../enterprise/entities/color';
import { Either, right } from '@/core/either';

interface CreateColorUseCaseRequest {
  name: string;
}

type CreateColorUseCaseResponse = Either<
  null,
  {
    color: Color;
  }
>;

export class CreateColorUseCase {
  constructor(private colorRepository: ColorRepository) {}

  async execute({
    name,
  }: CreateColorUseCaseRequest): Promise<CreateColorUseCaseResponse> {
    const color = Color.create({
      name,
    });

    await this.colorRepository.create(color);

    return right({
      color,
    });
  }
}
