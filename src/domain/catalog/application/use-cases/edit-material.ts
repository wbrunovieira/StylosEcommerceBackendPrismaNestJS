import { Material } from "../../enterprise/entities/material";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { PrismaMaterialRepository } from "../repositories/prisma-material-repository";
import { Injectable } from "@nestjs/common";

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

@Injectable()
export class EditMaterialUseCase {
  constructor(private materialsRepository: PrismaMaterialRepository) {}

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
