import { MaterialRepository } from '../repositories/material-repository';
import { Material } from '../../enterprise/entities/material';
import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from './errors/resource-not-found-error';

interface EditMaterialUseCaseRequest {
  materialId: string;
  name: string;
}

type EditMaterialUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    material: Material;
  }
>;

export class EditMaterialUseCase {
  constructor(private materialsRepository: MaterialRepository) {}

  async execute({
    materialId,
    name,
  }: EditMaterialUseCaseRequest): Promise<EditMaterialUseCaseResponse> {
    const material = await this.materialsRepository.findById(materialId);

    if (!material) {
      return left(new ResourceNotFoundError());
    }

    material.name = name;

    await this.materialsRepository.save(material);

    return right({
      material,
    });
  }
}
