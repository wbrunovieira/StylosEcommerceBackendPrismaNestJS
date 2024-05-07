import { Either, left, right } from '@/core/either';
import { ColorRepository } from '../repositories/color-repository';
import { ResourceNotFoundError } from './errors/resource-not-found-error';

interface DeleteColorUseCaseRequest {
  colorId: string;
}

type DeleteColorUseCaseResponse = Either<ResourceNotFoundError, {}>;

export class DeleteColorUseCase {
  constructor(private colorsRepository: ColorRepository) {}

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
