import { Brand } from "../../enterprise/entities/brand";
import { Either, right } from "@/core/either";

import { Inject, Injectable } from "@nestjs/common";
import { IBrandRepository } from "../repositories/i-brand-repository";

interface CreateBrandUseCaseRequest {
  name: string;
}

type CreateBrandUseCaseResponse = Either<
  null,
  {
    brand: Brand;
  }
>;

@Injectable()
export class CreateBrandUseCase {
  constructor(
    @Inject("IBrandRepository") private brandRepository: IBrandRepository
  ) {}

  async execute({
    name,
  }: CreateBrandUseCaseRequest): Promise<CreateBrandUseCaseResponse> {
    const brand = Brand.create({
      name,
    });

    await this.brandRepository.create(brand);

    return right({
      brand,
    });
  }
}
