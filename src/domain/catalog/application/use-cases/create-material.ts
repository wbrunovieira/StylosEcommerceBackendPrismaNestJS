import { MaterialRepository } from "../repositories/material-repository";
import { Material } from "../../enterprise/entities/material";
import { Either, right } from "@/core/either";
import { PrismaMaterialRepository } from "../repositories/prisma-material-repository";
import { Injectable } from "@nestjs/common";

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
  constructor(private materialRepository: PrismaMaterialRepository) {}

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
