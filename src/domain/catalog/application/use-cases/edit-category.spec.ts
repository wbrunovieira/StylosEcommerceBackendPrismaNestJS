import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { InMemoryCategoryRepository } from "@test/repositories/in-memory-category-repository";
import { EditCategoryUseCase } from "./edit-category";
import { makeCategory } from "@test/factories/make-category";

let inMemoryCategoryRepository: InMemoryCategoryRepository;
let sut: EditCategoryUseCase;

describe("Edit Category", () => {
  beforeEach(() => {
    inMemoryCategoryRepository = new InMemoryCategoryRepository();
    sut = new EditCategoryUseCase(inMemoryCategoryRepository as any);
  });

  it("should be able to edit a category", async () => {
    const newCategory = makeCategory({}, new UniqueEntityID("category-1"));

    await inMemoryCategoryRepository.create(newCategory);

    const result = await sut.execute({
      categoryId: newCategory.id.toValue(),
      name: "name teste",
    });

    expect(result.isRight()).toBe(true);
  });

  it("should return an error if the category does not exist", async () => {
    const result = await sut.execute({
      categoryId: "non-existing-category",
      name: "name teste",
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
