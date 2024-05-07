import { SizeRepository } from '../repositories/size-repository';
import { Size } from '../../enterprise/entities/size';
import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from './errors/resource-not-found-error';

interface EditSizeUseCaseRequest {
  sizeId: string;
  name: string;
}

type EditSizeUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    size: Size;
  }
>;

export class EditSizeUseCase {
  constructor(private sizesRepository: SizeRepository) {}

  async execute({
    sizeId,
    name,
  }: EditSizeUseCaseRequest): Promise<EditSizeUseCaseResponse> {
    const size = await this.sizesRepository.findById(sizeId);

    if (!size) {
      return left(new ResourceNotFoundError());
    }

    size.name = name;

    await this.sizesRepository.save(size);

    return right({
      size,
    });
  }
}
