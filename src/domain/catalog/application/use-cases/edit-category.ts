import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

import { Injectable } from "@nestjs/common";
import { Category } from "../../enterprise/entities/category";
import { PrismaCategoryRepository } from "../repositories/prisma-category-repository";

interface EditCategoryUseCaseRequest {
  categoryId: string;
  name: string;
}

type EditCategoryUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    category: Category;
  }
>;

@Injectable()
export class EditCategoryUseCase {
  constructor(private categoryRepository: PrismaCategoryRepository) {}

  async execute({
    categoryId,
    name,
  }: EditCategoryUseCaseRequest): Promise<EditCategoryUseCaseResponse> {
    const category = await this.categoryRepository.findById(categoryId);

    if (!category) {
      return left(new ResourceNotFoundError());
    }

    category.name = name;

    await this.categoryRepository.save(category);

    return right({
      category,
    });
  }
}
