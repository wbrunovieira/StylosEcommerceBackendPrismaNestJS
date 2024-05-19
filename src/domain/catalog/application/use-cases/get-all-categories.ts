import { Either, left, right } from "@/core/either";
import { Injectable } from "@nestjs/common";

import { PaginationParams } from "@/core/repositories/pagination-params";
import { Category } from "../../enterprise/entities/category";
import { ICategoryRepository } from "../repositories/i-category-repository";

type GetAllCategoriesUseCaseResponse = Either<Error, Category[]>;

@Injectable()
export class GetAllCategoriesUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(
    params: PaginationParams
  ): Promise<GetAllCategoriesUseCaseResponse> {
    try {
      console.log("entrou no get all usecase");
      const categoryResult = await this.categoryRepository.findAll(params);
      console.log("result do usecase", categoryResult);
      if (categoryResult.isLeft()) {
        console.log("use case deu left", categoryResult);
        return left(new Error("Failed to find categories"));
      }
      return right(categoryResult.value);
    } catch (error) {
      return left(new Error("Repository error"));
    }
  }
}
