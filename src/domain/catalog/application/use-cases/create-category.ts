import { Either, right } from "@/core/either";

import { Injectable } from "@nestjs/common";
import { Category } from "../../enterprise/entities/category";
import { PrismaCategoryRepository } from "../repositories/prisma-category-repository";

interface CreateCategoryUseCaseRequest {
  name: string;
}

type CreateCategoryUseCaseResponse = Either<
  null,
  {
    category: Category;
  }
>;
@Injectable()
export class CreateCategoryUseCase {
  constructor(private categoryRepository: PrismaCategoryRepository) {}

  async execute({
    name,
  }: CreateCategoryUseCaseRequest): Promise<CreateCategoryUseCaseResponse> {
    const category = Category.create({
      name,
    });

    await this.categoryRepository.create(category);

    return right({
      category,
    });
  }
}
