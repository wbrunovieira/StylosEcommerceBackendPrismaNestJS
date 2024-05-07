import { Either, left, right } from "@/core/either";

import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { Injectable } from "@nestjs/common";
import { PrismaSizeRepository } from "../repositories/prima-size-repository";

interface DeleteSizeUseCaseRequest {
  sizeId: string;
}

type DeleteSizeUseCaseResponse = Either<ResourceNotFoundError, {}>;

@Injectable()
export class DeleteSizeUseCase {
  constructor(private sizesRepository: PrismaSizeRepository) {}

  async execute({
    sizeId,
  }: DeleteSizeUseCaseRequest): Promise<DeleteSizeUseCaseResponse> {
    const size = await this.sizesRepository.findById(sizeId);

    if (!size) {
      return left(new ResourceNotFoundError());
    }

    await this.sizesRepository.delete(size);

    return right({});
  }
}
