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

import { makeBrand } from "@test/factories/make-brand";
import { makeMaterial } from "@test/factories/make-material";
import { makeProduct } from "@test/factories/make-product";
import { makeColor } from "@test/factories/make-color";
import { makeSize } from "@test/factories/make-size";
import { makeCategory } from "@test/factories/make-category";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { fail } from "assert";

const colorId = new UniqueEntityID("your_string_id_here");
const color = makeColor({}, colorId);

const categoryId = new UniqueEntityID("your_string_id_here");
const brandId = new UniqueEntityID("your_string_id_here");
const category = makeCategory({}, categoryId);

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

    mockBrandRepository.findById = vi.fn((id: string) =>
      Promise.resolve(makeBrand())
    );
    mockMaterialRepository.findById = vi.fn((id: string) =>
      Promise.resolve(makeMaterial())
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

  it("should create a product with all fields", async () => {
    const product = makeProduct({
      productColors: [new UniqueEntityID("color_id_as_string")],
      productSizes: [new UniqueEntityID("size_id_as_string")],
      productCategories: [new UniqueEntityID("category_id_as_string")],
      materialId: new UniqueEntityID("material_id_as_string"),
      brandId: new UniqueEntityID("material_id_as_string"),

      price: 200,
      stock: 20,
      height: 2,
      width: 2,
      length: 2,
      weight: 2,

      onSale: true,
      discount: 10,
      isFeatured: true,
      isNew: true,
      images: ["image1.jpg", "image2.jpg"],
    });

    const request = {
      name: product.name,
      description: product.description,
      productColors: product.productColors?.map((color) => color.toString()),
      productSizes: product.productSizes?.map((size) => size.toString()),
      productCategories: product.productCategories?.map((category) =>
        category.toString()
      ),
      materialId: product.materialId?.toString(),
      brandId: product.brandId.toString(),
      price: product.price,
      stock: product.stock,
      height: product.height,
      width: product.width,
      length: product.length,
      weight: product.weight,
      onSale: product.onSale,
      discount: product.discount,
      isFeatured: product.isFeatured,
      isNew: product.isNew,
      images: product.images,
    };

    const result = await useCase.execute(request);
    expect(result.isRight()).toBeTruthy();
  });

  it("should fail if required fields are missing", async () => {
    const request = {
      name: "",
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
    };
    const result = await useCase.execute(request);
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
     
      expect(result.value.message).toEqual("Product name is required");
    } else {
      fail("Expected a Left with an error but got Right");
    }
  });
});
