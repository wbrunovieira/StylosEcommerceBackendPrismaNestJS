import { PrismaColorRepository } from "../repositories/prisma-color-repository";
import { Color } from "../../enterprise/entities/color";
import { Either, right } from "@/core/either";
import { Injectable } from "@nestjs/common";
import { IColorRepository } from "../repositories/i-color-repository";

interface CreateColorUseCaseRequest {
  name: string;
}

type CreateColorUseCaseResponse = Either<
  null,
  {
    color: Color;
  }
>;

@Injectable()
export class CreateColorUseCase {
  constructor(private PrismaColorRepository: IColorRepository) {}

  async execute({
    name,
  }: CreateColorUseCaseRequest): Promise<CreateColorUseCaseResponse> {
    const color = Color.create({
      name,
    });

    await this.PrismaColorRepository.create(color);

    return right({
      color,
    });
  }
}
