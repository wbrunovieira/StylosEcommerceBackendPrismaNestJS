import { InMemoryCategoryRepository } from "@test/repositories/in-memory-category-repository";
import { CreateCategoryUseCase } from "./create-category";

let inMemoryCategoryRepository: InMemoryCategoryRepository;
let sut: CreateCategoryUseCase;

describe("CreateCategorydUseCase", () => {
  beforeEach(() => {
    inMemoryCategoryRepository = new InMemoryCategoryRepository();
    sut = new CreateCategoryUseCase(inMemoryCategoryRepository as any);
  });

  it("should be able to create a category", async () => {
    const result = await sut.execute({
      name: "red",
    });

    expect(result.isRight).toBeTruthy();
    expect(inMemoryCategoryRepository.items[0]).toEqual(result.value?.category);
  });
});
