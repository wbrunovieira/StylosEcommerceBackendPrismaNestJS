import { Either, left, right } from '@/core/either';
import { SizeRepository } from '../repositories/size-repository';
import { ResourceNotFoundError } from './errors/resource-not-found-error';

interface DeleteSizeUseCaseRequest {
  sizeId: string;
}

type DeleteSizeUseCaseResponse = Either<ResourceNotFoundError, {}>;

export class DeleteSizeUseCase {
  constructor(private sizesRepository: SizeRepository) {}

  async execute({
    sizeId,
  }: DeleteSizeUseCaseRequest): Promise<DeleteSizeUseCaseResponse> {
    const size = await this.sizesRepository.findById(sizeId);

    if (!size) {
      return left(new ResourceNotFoundError());
    }

    await this.sizesRepository.delete(size);

    return right({});
  }
}
