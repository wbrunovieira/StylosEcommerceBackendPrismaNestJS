import { Either, left, right } from "@/core/either";

import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { PrismaMaterialRepository } from "../repositories/prisma-material-repository";
import { Injectable } from "@nestjs/common";

interface DeleteMaterialUseCaseRequest {
  materialId: string;
}

type DeleteMaterialUseCaseResponse = Either<ResourceNotFoundError, {}>;

@Injectable()
export class DeleteMaterialUseCase {
  constructor(private materialsRepository: PrismaMaterialRepository) {}

  async execute({
    materialId,
  }: DeleteMaterialUseCaseRequest): Promise<DeleteMaterialUseCaseResponse> {
    const material = await this.materialsRepository.findById(materialId);

    if (!material) {
      return left(new ResourceNotFoundError());
    }

    await this.materialsRepository.delete(material);

    return right({});
  }
}
