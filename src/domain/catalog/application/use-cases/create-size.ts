import { SizeRepository } from '../repositories/size-repository';
import { Size } from '../../enterprise/entities/size';
import { Either, right } from '@/core/either';

interface CreateSizeUseCaseRequest {
  name: string;
}

type CreateSizeUseCaseResponse = Either<
  null,
  {
    size: Size;
  }
>;

export class CreateSizeUseCase {
  constructor(private sizeRepository: SizeRepository) {}

  async execute({
    name,
  }: CreateSizeUseCaseRequest): Promise<CreateSizeUseCaseResponse> {
    const size = Size.create({
      name,
    });

    await this.sizeRepository.create(size);

    return right({
      size,
    });
  }
}
