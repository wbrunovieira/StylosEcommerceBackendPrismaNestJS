import { Size } from "../../enterprise/entities/size";
import { Either, right } from "@/core/either";
import { PrismaSizeRepository } from "../repositories/prima-size-repository";
import { Injectable } from "@nestjs/common";

interface CreateSizeUseCaseRequest {
  name: string;
}

type CreateSizeUseCaseResponse = Either<
  null,
  {
    size: Size;
  }
>;

@Injectable()
export class CreateSizeUseCase {
  constructor(private sizeRepository: PrismaSizeRepository) {}

  async execute({
    name,
  }: CreateSizeUseCaseRequest): Promise<CreateSizeUseCaseResponse> {
    const size = Size.create({
      name,
    });

    await this.sizeRepository.create(size);

    return right({
      size,
    });
  }
}
