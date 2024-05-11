import { SizeRepository } from "../repositories/i-size-repository";
import { Size } from "../../enterprise/entities/size";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { Injectable } from "@nestjs/common";
import { PrismaSizeRepository } from "../repositories/prima-size-repository";

interface EditSizeUseCaseRequest {
  sizeId: string;
  name: string;
}

type EditSizeUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    size: Size;
  }
>;
@Injectable()
export class EditSizeUseCase {
  constructor(private sizesRepository: PrismaSizeRepository) {}

  async execute({
    sizeId,
    name,
  }: EditSizeUseCaseRequest): Promise<EditSizeUseCaseResponse> {
    const size = await this.sizesRepository.findById(sizeId);

    if (!size) {
      return left(new ResourceNotFoundError());
    }

    size.name = name;

    await this.sizesRepository.save(size);

    return right({
      size,
    });
  }
}
