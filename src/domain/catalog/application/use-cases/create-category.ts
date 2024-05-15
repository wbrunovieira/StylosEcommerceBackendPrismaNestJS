import { Either, right } from "@/core/either";

import { Injectable } from "@nestjs/common";
import { Category } from "../../enterprise/entities/category";

import { ICategoryRepository } from "../repositories/i-category-repository";

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
  constructor(private categoryRepository: ICategoryRepository) {}

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
