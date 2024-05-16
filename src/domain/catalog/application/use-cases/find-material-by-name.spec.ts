

import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { InMemoryMaterialRepository } from "@test/repositories/in-memory-material-repository";
import { FindMaterialByNameUseCase } from "./find-material-by-name";
import { makeMaterial } from "@test/factories/make-material";

let inMemoryMaterialRepository: InMemoryMaterialRepository;
let findMaterialByNameUseCase: FindMaterialByNameUseCase;

describe("FindMaterialByNameUseCase", () => {
  beforeEach(() => {
    inMemoryMaterialRepository = new InMemoryMaterialRepository();
    findMaterialByNameUseCase = new FindMaterialByNameUseCase(inMemoryMaterialRepository as any);
  });

  it("should find a material by name", async () => {
    const newMaterial = makeMaterial({ name: "Test Material" }, new UniqueEntityID("material-1"));
    await inMemoryMaterialRepository.create(newMaterial);

    const result = await findMaterialByNameUseCase.execute({ name: "Test Material" });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.material.name).toBe("Test Material");
    }
  });

  it("should return an error if the material is not found", async () => {
    const result = await findMaterialByNameUseCase.execute({ name: "Non-existing Material" });

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    }
  });
});
