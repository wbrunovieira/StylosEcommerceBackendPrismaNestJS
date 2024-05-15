
import { Material } from "../../enterprise/entities/material";
import { Either, right } from "@/core/either";

import { Injectable } from "@nestjs/common";
import { IMaterialRepository } from "../repositories/i-material-repository";

interface CreateMaterialUseCaseRequest {
  name: string;
}

type CreateMaterialUseCaseResponse = Either<
  null,
  {
    material: Material;
  }
>;

@Injectable()
export class CreateMaterialUseCase {
  constructor(private materialRepository: IMaterialRepository) {}

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
