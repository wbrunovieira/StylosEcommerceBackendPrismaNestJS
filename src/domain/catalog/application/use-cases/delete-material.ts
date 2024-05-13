import { Either, left, right } from "@/core/either";

import { ResourceNotFoundError } from "./errors/resource-not-found-error";

import { Injectable } from "@nestjs/common";
import { IMaterialRepository } from "../repositories/i-material-repository";

interface DeleteMaterialUseCaseRequest {
  materialId: string;
}

type DeleteMaterialUseCaseResponse = Either<ResourceNotFoundError, {}>;

@Injectable()
export class DeleteMaterialUseCase {
  constructor(private materialsRepository: IMaterialRepository) {}

  async execute({
    materialId,
  }: DeleteMaterialUseCaseRequest): Promise<DeleteMaterialUseCaseResponse> {
    const materialResult = await this.materialsRepository.findById(materialId);

    if (materialResult.isLeft()) {
      return left(new ResourceNotFoundError("Brand not found"));
    }
    const material = materialResult.value;

    await this.materialsRepository.delete(material);

    return right({});
  }
}
