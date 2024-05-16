import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { Material } from "../../enterprise/entities/material";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { left, right } from "@/core/either";
import { InMemoryMaterialRepository } from "@test/repositories/in-memory-material-repository";
import { FindMaterialByIdUseCase } from "./find-material-by-id";

let inMemoryMaterialRepository: InMemoryMaterialRepository;
let sut: FindMaterialByIdUseCase;

describe("FindMAterialByIdUseCase", () => {
  beforeEach(() => {
    inMemoryMaterialRepository = new InMemoryMaterialRepository();
    sut = new FindMaterialByIdUseCase(inMemoryMaterialRepository);
  });

  it("should be able to find a material by id", async () => {
    const material = Material.create(
      {
        name: "MaterialName",
      },
      new UniqueEntityID("material-1")
    );

    inMemoryMaterialRepository.items.push(material);

    const result = await sut.execute({ id: "material-1" });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.material).toEqual(material);
    }
  });

  it("should return an error if the material does not exist", async () => {
    const result = await sut.execute({ id: "non-existent-id" });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    }
  });
});
