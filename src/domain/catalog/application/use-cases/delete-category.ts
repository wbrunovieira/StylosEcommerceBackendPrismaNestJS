import { Either, left, right } from "@/core/either";

import { ResourceNotFoundError } from "./errors/resource-not-found-error";

import { Injectable } from "@nestjs/common";
import { PrismaCategoryRepository } from "../repositories/prisma-category-repository";

interface DeleteCategoryUseCaseRequest {
  categoryId: string;
}

type DeleteCategoryUseCaseResponse = Either<ResourceNotFoundError, {}>;

@Injectable()
export class DeleteCategoryUseCase {
  constructor(private categoryRepository: PrismaCategoryRepository) {}

  async execute({
    categoryId,
  }: DeleteCategoryUseCaseRequest): Promise<DeleteCategoryUseCaseResponse> {
    const category = await this.categoryRepository.findById(categoryId);

    if (!category) {
      return left(new ResourceNotFoundError());
    }

    await this.categoryRepository.delete(category);

    return right({});
  }
}
