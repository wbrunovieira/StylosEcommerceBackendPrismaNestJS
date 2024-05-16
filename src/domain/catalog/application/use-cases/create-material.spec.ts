import { InMemoryMaterialRepository } from "@test/repositories/in-memory-material-repository";

import { CreateMaterialUseCase } from "./create-material";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

let inMemoryMaterialRepository: InMemoryMaterialRepository;
let sut: CreateMaterialUseCase;

describe("CreateMaterialUseCase", () => {
  beforeEach(() => {
    inMemoryMaterialRepository = new InMemoryMaterialRepository();
    sut = new CreateMaterialUseCase(inMemoryMaterialRepository);
  });

  it("should be able to create a material", async () => {
    const result = await sut.execute({
      name: "cotton",
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(inMemoryMaterialRepository.items[0]).toEqual(
        result.value.material
      );
    }
  });

  it("should not be able to create a material without a name", async () => {
    const result = await sut.execute({
      name: "",
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
      if (result.value instanceof ResourceNotFoundError) {
        expect(result.value.message).toBe("Material name is required");
      }
    }
  });

  it("should not be able to create a material with a duplicate name", async () => {
    await sut.execute({ name: "red" });

    const result = await sut.execute({ name: "red" });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
      if (result.value instanceof ResourceNotFoundError) {
        expect(result.value.message).toBe(
          "Material with this name already exists"
        );
      }
    }
  });

  it("should not create a material with a name that is the same after normalization", async () => {
    await sut.execute({ name: " Material  " });

    const result = await sut.execute({ name: "material" });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
      if (result.value instanceof ResourceNotFoundError) {
        expect(result.value.message).toBe(
          "Material with this name already exists"
        );
      }
    }
  });

  it("should be able to find a material by name regardless of case and spaces", async () => {
    await sut.execute({
      name: "  Material ",
    });

    const foundMaterial =
      await inMemoryMaterialRepository.findByName("material");

    expect(foundMaterial.isRight()).toBeTruthy();
    expect(foundMaterial.value?.name).toEqual("Material");
  });

  it("should not be able to create a material with a name that contains only spaces", async () => {
    const result = await sut.execute({ name: "   " });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
      if (result.value instanceof ResourceNotFoundError) {
        expect(result.value.message).toBe("Material name is required");
      }
    }
  });

  it("should be able to create a material with special characters in the name", async () => {
    const result = await sut.execute({ name: "Material#@!" });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(inMemoryMaterialRepository.items[0]).toEqual(
        result.value.material
      );
    }
  });

  it("should handle errors thrown by the repository", async () => {
    vi.spyOn(inMemoryMaterialRepository, "create").mockImplementationOnce(
      () => {
        throw new Error("Repository error");
      }
    );

    const result = await sut.execute({ name: "MaterialWithError" });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      const error = result.value as Error;
      expect(error.message).toBe("Repository error");
    }
  });

  it("should not create a material with a name shorter than 3 characters", async () => {
    const result = await sut.execute({ name: "AB" });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
      if (result.value instanceof ResourceNotFoundError) {
        expect(result.value.message).toBe(
          "Material name must be at least 3 characters long"
        );
      }
    }
  });

  it("should not create a material with a name longer than 50 characters", async () => {
    const longName = "A".repeat(51);
    const result = await sut.execute({ name: longName });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
      if (result.value instanceof ResourceNotFoundError) {
        expect(result.value.message).toBe(
          "Material name must be less than 50 characters long"
        );
      }
    }
  });
});
