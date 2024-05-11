import { InMemoryBrandRepository } from "@test/repositories/in-memory-brand-repository";
import { CreateProductUseCase } from "./create-product";
import { InMemoryMaterialRepository } from "@test/repositories/in-memory-material-repository";
import { InMemoryProductRepository } from "@test/repositories/in-memory-product-repository";
import { InMemoryProductColorRepository } from "@test/repositories/in-memory-product-color-repository";
import { InMemoryProductSizeRepository } from "@test/repositories/in-memory-product-size-repository";
import { InMemoryProductCategoryRepository } from "@test/repositories/in-memory-product-category";
import { IProductRepository } from "../repositories/i-product-repository";
import { IProductColorRepository } from "../repositories/i-product-color-repository";
import { IProductSizeRepository } from "../repositories/i-product-size-repository";
import { IProductCategoryRepository } from "../repositories/i-product-category-repository";
import { IMaterialRepository } from "../repositories/i-material-repository";
import { IBrandRepository } from "../repositories/i-brand-repository";

describe("CreateProductUseCase", () => {
  let useCase: CreateProductUseCase;
  let mockProductRepository: IProductRepository;
  let mockProductColorRepository: IProductColorRepository;
  let mockProductSizeRepository: IProductSizeRepository;
  let mockProductCategoryRepository: IProductCategoryRepository;
  let mockBrandRepository: IBrandRepository;
  let mockMaterialRepository: IMaterialRepository;

  beforeEach(() => {
    mockProductRepository = new InMemoryProductRepository();
    mockProductColorRepository = new InMemoryProductColorRepository();
    mockProductSizeRepository = new InMemoryProductSizeRepository();
    mockProductCategoryRepository = new InMemoryProductCategoryRepository();
    mockBrandRepository = new InMemoryBrandRepository();
    mockMaterialRepository = new InMemoryMaterialRepository();
    useCase = new CreateProductUseCase(
      mockProductRepository,
      mockProductColorRepository,
      mockProductSizeRepository,
      mockProductCategoryRepository,
      mockBrandRepository,
      mockMaterialRepository
    );
  });

  it("should create a product", async () => {
    const result = await useCase.execute({
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
    expect(result).toBeDefined();
  });
});
