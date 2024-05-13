import { Material } from "../../enterprise/entities/material";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

import { Injectable } from "@nestjs/common";
import { IMaterialRepository } from "../repositories/i-material-repository";

interface EditMaterialUseCaseRequest {
  materialId: string;
  name: string;
}

type EditMaterialUseCaseResponse = Either<
  ResourceNotFoundError,
  { material: Material }
>;

@Injectable()
export class EditMaterialUseCase {
  constructor(private materialsRepository: IMaterialRepository) {}

  async execute({
    materialId,
    name,
  }: EditMaterialUseCaseRequest): Promise<EditMaterialUseCaseResponse> {
    const materialResult = await this.materialsRepository.findById(materialId);

    if (materialResult.isLeft()) {
      return left(new ResourceNotFoundError("Material not found"));
    }

    const material = materialResult.value;
    material.name = name;
    const saveResult = await this.materialsRepository.save(material);

    if (saveResult.isLeft()) {
      return left(new ResourceNotFoundError("Failed to update material"));
    }

    return right({
      material,
    });
  }
}
