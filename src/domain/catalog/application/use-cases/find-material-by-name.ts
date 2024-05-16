import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { Injectable } from "@nestjs/common";

import { Material } from "../../enterprise/entities/material";
import { IMaterialRepository } from "../repositories/i-material-repository";

interface FindMaterialByNameUseCaseRequest {
  name: string;
}

type FindMaterialByNameUseCaseResponse = Either<
  ResourceNotFoundError,
  { material: Material }
>;

@Injectable()
export class FindMaterialByNameUseCase {
  constructor(private materialRepository: IMaterialRepository) {}

  async execute({
    name,
  }: FindMaterialByNameUseCaseRequest): Promise<FindMaterialByNameUseCaseResponse> {
    const materialResult = await this.materialRepository.findByName(name);

    if (materialResult.isLeft()) {
      return left(new ResourceNotFoundError("Material not found"));
    }

    return right({
        material: materialResult.value,
    });
  }
}
