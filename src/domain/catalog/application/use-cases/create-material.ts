import { MaterialRepository } from '../repositories/material-repository';
import { Material } from '../../enterprise/entities/material';
import { Either, right } from '@/core/either';

interface CreateMaterialUseCaseRequest {
  name: string;
}

type CreateMaterialUseCaseResponse = Either<
  null,
  {
    material: Material;
  }
>;

export class CreateMaterialUseCase {
  constructor(private materialRepository: MaterialRepository) {}

  async execute({
    name,
  }: CreateMaterialUseCaseRequest): Promise<CreateMaterialUseCaseResponse> {
    const material = Material.create({
      name,
    });

    await this.materialRepository.create(material);

    return right({
      material,
    });
  }
}
