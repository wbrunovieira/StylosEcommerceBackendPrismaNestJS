import { Material } from "../../enterprise/entities/material";
import { Either, left, right } from "@/core/either";

import { Injectable } from "@nestjs/common";
import { IMaterialRepository } from "../repositories/i-material-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

interface CreateMaterialUseCaseRequest {
  name: string;
}

type CreateMaterialUseCaseResponse = Either<
  ResourceNotFoundError | null,
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
    try {
      const trimmedName = name.trim();
      if (!trimmedName || trimmedName.length === 0) {
        return left(new ResourceNotFoundError("Material name is required"));
      }

      if (trimmedName.length < 3) {
        return left(
          new ResourceNotFoundError(
            "Material name must be at least 3 characters long"
          )
        );
      }

      if (trimmedName.length > 50) {
        return left(
          new ResourceNotFoundError(
            "Material name must be less than 50 characters long"
          )
        );
      }

      const existingMaterial = await this.materialRepository.findByName(trimmedName);
      if (existingMaterial.isRight()) {
        return left(
          new ResourceNotFoundError("Material with this name already exists")
        );
      }
      const material = Material.create({
        name: trimmedName,
      });

      await this.materialRepository.create(material);

      return right({
        material,
      });
    } catch (error) {
      return left(error as Error);
    }
  }
}
