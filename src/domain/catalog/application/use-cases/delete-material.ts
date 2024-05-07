import { Either, left, right } from '@/core/either';
import { MaterialRepository } from '../repositories/material-repository';
import { ResourceNotFoundError } from './errors/resource-not-found-error';

interface DeleteMaterialUseCaseRequest {
  materialId: string;
}

type DeleteMaterialUseCaseResponse = Either<ResourceNotFoundError, {}>;

export class DeleteMaterialUseCase {
  constructor(private materialsRepository: MaterialRepository) {}

  async execute({
    materialId,
  }: DeleteMaterialUseCaseRequest): Promise<DeleteMaterialUseCaseResponse> {
    const material = await this.materialsRepository.findById(materialId);

    if (!material) {
      return left(new ResourceNotFoundError());
    }

    await this.materialsRepository.delete(material);

    return right({});
  }
}
