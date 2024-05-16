import { InMemoryBrandRepository } from "@test/repositories/in-memory-brand-repository";


import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { describe, it, beforeEach, expect, vi } from "vitest";
import { PaginationParams } from "@/core/repositories/pagination-params";
import { InMemoryMaterialRepository } from "@test/repositories/in-memory-material-repository";
import { GetAllMaterialsUseCase } from "./get-all-materials";
import { Material } from "../../enterprise/entities/material";

let inMemoryMaterialsRepository: InMemoryMaterialRepository;
let sut: GetAllMaterialsUseCase;

describe("GetAllMaterialsUseCase", () => {
  beforeEach(() => {
    inMemoryMaterialsRepository = new InMemoryMaterialRepository();
    sut = new GetAllMaterialsUseCase(inMemoryMaterialsRepository);
  });

  it("should return a list of materials", async () => {
    const mockMaterials = [
        Material.create({ name: "Material 1" }, new UniqueEntityID("material-1")),
      Material.create({ name: "Material 2" }, new UniqueEntityID("material-2")),
    ];

    inMemoryMaterialsRepository.items = mockMaterials;

    const params: PaginationParams = { page: 1, pageSize: 10 };
    const result = await sut.execute(params);

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value).toEqual(mockMaterials);
    }
  });

  it("should return an empty list if no materials exist", async () => {
    const params: PaginationParams = { page: 1, pageSize: 10 };
    const result = await sut.execute(params);

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value).toEqual([]);
    }
  });

  it("should handle errors thrown by the repository", async () => {
    vi.spyOn(inMemoryMaterialsRepository, "findAll").mockImplementationOnce(() => {
      throw new Error("Repository error");
    });

    const params: PaginationParams = { page: 1, pageSize: 10 };
    const result = await sut.execute(params);

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      const error = result.value as Error;
      expect(error.message).toBe("Repository error");
    }
  });
});
