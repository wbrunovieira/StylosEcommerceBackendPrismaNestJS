import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { Injectable } from "@nestjs/common";

import { Material } from "../../enterprise/entities/material";
import { IMaterialRepository } from "../repositories/i-material-repository";

interface FindMaterialByIdUseCaseRequest {
  id: string;
}

type FindMaterialByIdUseCaseResponse = Either<
  ResourceNotFoundError,
  { material: Material }
>;

@Injectable()
export class FindMaterialByIdUseCase {
  constructor(private materialRepository: IMaterialRepository) {}

  async execute({
    id,
  }: FindMaterialByIdUseCaseRequest): Promise<FindMaterialByIdUseCaseResponse> {
    const materialResult = await this.materialRepository.findById(id);

    if (materialResult.isLeft()) {
      return left(new ResourceNotFoundError("Material not found"));
    }

    return right({
        material: materialResult.value,
    });
  }
}
