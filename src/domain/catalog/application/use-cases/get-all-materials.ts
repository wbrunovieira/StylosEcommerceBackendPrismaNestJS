import { Either, left, right } from "@/core/either";
import { Injectable } from "@nestjs/common";


import { PaginationParams } from "@/core/repositories/pagination-params";

import { IMaterialRepository } from "../repositories/i-material-repository";
import { Material } from "../../enterprise/entities/material";

type GetAllMaterialsUseCaseResponse = Either<Error, Material[]>;

@Injectable()
export class GetAllMaterialsUseCase {
  constructor(private materialsRepository: IMaterialRepository) {}

  async execute(
    params: PaginationParams
  ): Promise<GetAllMaterialsUseCaseResponse> {
    try {
     
      const materialsResult = await this.materialsRepository.findAll(params);
      if (materialsResult.isLeft()) {
        console.error("Failed to find materials:", materialsResult.value);
        return left(new Error("Failed to find materials"));
      }
    
      return right(materialsResult.value);
    } catch (error) {
      console.error("Error in GetAllMaterialsUseCase:", error);
      return left(new Error("Repository error"));
    }
  }
}
