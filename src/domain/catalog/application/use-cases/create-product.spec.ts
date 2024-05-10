import { InMemoryBrandRepository } from "@test/repositories/in-memory-brand-repository";
import { CreateProductUseCase } from "./create-product";
import { InMemoryMaterialRepository } from "@test/repositories/in-memory-material-repository";
import { InMemoryProductRepository } from "@test/repositories/in-memory-product-repository";
import { InMemoryProductColorRepository } from "@test/repositories/in-memory-product-color-repository";
import { InMemoryProductSizeRepository } from "@test/repositories/in-memory-product-size-repository";
import { InMemoryProductCategoryRepository } from "@test/repositories/in-memory-product-category";

describe("CreateProductUseCase", () => {
  let sut: CreateProductUseCase;
  let inMemoryProductRepository: InMemoryProductRepository;
  let inMemoryProductColorRepository: InMemoryProductColorRepository;
  let inMemoryProductSizeRepository: InMemoryProductSizeRepository;
  let inMemoryProductCategoryRepository: InMemoryProductCategoryRepository;
  let inMemoryMaterialRepository: InMemoryMaterialRepository;
  let inMemoryBrandRepository: InMemoryBrandRepository;

  beforeEach(() => {
    inMemoryProductRepository = new InMemoryProductRepository();
    inMemoryProductColorRepository = new InMemoryProductColorRepository();
    inMemoryProductSizeRepository = new InMemoryProductSizeRepository();
    inMemoryProductCategoryRepository = new InMemoryProductCategoryRepository();
    inMemoryMaterialRepository = new InMemoryMaterialRepository();
    inMemoryBrandRepository = new InMemoryBrandRepository();

    sut = new CreateProductUseCase(
      inMemoryProductRepository,
      inMemoryProductColorRepository,
      inMemoryProductSizeRepository,
      inMemoryProductCategoryRepository,
      inMemoryBrandRepository,
      inMemoryMaterialRepository
    );
  });

  it("should be able to create a product without colors and sizes", async () => {
    const result = await sut.execute({
      name: "Test Product",
      description: "A test product description",
      productColors: [],
      productSizes: [],
      productCategories: [],
      materialId: "1",
      brandId: "1",
      price: 100,
      stock: 10,
      onSale: false,
      discount: 0,
      isFeatured: false,
      isNew: false,
      images: [],
    });

    expect(result.isRight()).toBeTruthy();
    expect(inMemoryProductRepository.items).toHaveLength(1);
    expect(inMemoryProductRepository.items[0].name).toEqual("Test Product");
    expect(inMemoryProductRepository.items[0].price).toEqual(100);
  });
});
