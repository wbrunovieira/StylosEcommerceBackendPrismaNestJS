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
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { left, right } from "@/core/either";
import { InMemoryColorRepository } from "@test/repositories/in-memory-color-repository";
import { IColorRepository } from "../repositories/i-color-repository";
import { fail } from "assert";

describe("CreateProductUseCase", () => {
  let useCase: CreateProductUseCase;
  let mockProductRepository: IProductRepository;
  let mockProductColorRepository: IProductColorRepository;
  let mockProductSizeRepository: IProductSizeRepository;
  let mockProductCategoryRepository: IProductCategoryRepository;
  let mockBrandRepository: IBrandRepository;
  let mockMaterialRepository: IMaterialRepository;
  let mockColorRepository: IColorRepository;

  let brandId: UniqueEntityID;
  let materialId: UniqueEntityID;

  beforeEach(() => {
    brandId = new UniqueEntityID("82a6d71c-6378-4d11-8258-4ee8732161a3");
    materialId = new UniqueEntityID("f056524a-85bf-45a9-bf40-ebade896343c");

    const consistentBrand = makeBrand({ name: "Test Brand Name" }, brandId);
    const consistentMaterial = makeMaterial(
      { name: "Test Material Name" },
      materialId
    );

    mockProductRepository = new InMemoryProductRepository();
    mockProductColorRepository = new InMemoryProductColorRepository();
    mockProductSizeRepository = new InMemoryProductSizeRepository();
    mockProductCategoryRepository = new InMemoryProductCategoryRepository();
    mockBrandRepository = new InMemoryBrandRepository();
    mockMaterialRepository = new InMemoryMaterialRepository();
    mockColorRepository = new InMemoryColorRepository();

    mockBrandRepository.create(consistentBrand);
    mockMaterialRepository.create(consistentMaterial);

    console.log("mock Brand", mockBrandRepository);

    useCase = new CreateProductUseCase(
      mockProductRepository,

      mockBrandRepository,
      mockMaterialRepository
    );

    mockProductColorRepository.create = vi.fn(() =>
      Promise.resolve(left(new Error("Color not found")))
    );

    mockBrandRepository.findById = vi.fn((id) => {
      console.log(
        `FindById Brand called with: ${id}, expected: ${brandId.toString()}`
      );
      return id === brandId.toString()
        ? Promise.resolve(right(consistentBrand))
        : Promise.resolve(left(new ResourceNotFoundError("Brand not found")));
    });

    mockMaterialRepository.findById = vi.fn((id) => {
      console.log(
        `FindById Material called with: ${id}, expected: ${materialId.toString()}`
      );
      return id === materialId.toString()
        ? Promise.resolve(right(consistentMaterial))
        : Promise.resolve(
            left(new ResourceNotFoundError("Material not found"))
          );
    });
  });

  it("should create a product", async () => {
    console.log(
      `Creating product with materialId: ${materialId.toString()} and brandId: ${brandId.toString()}`
    );
    const result = await useCase.execute({
      name: "Test Product",
      description: "A test product description",
      productColors: [],
      productSizes: [],
      productCategories: [],
      materialId: materialId.toString(),
      brandId: brandId.toString(),
      price: 100,
      stock: 10,
      onSale: false,
      discount: 0,
      isFeatured: false,
      isNew: false,
      images: [],
    });

    expect(result).toBeDefined();
    expect(result.isRight()).toBeTruthy();
  });

  it("should create a product with Brands and Materials repo and fields", async () => {
    const request = {
      name: "Test Product",
      description: "A test product description",
      productColors: [new UniqueEntityID("color_id_as_string").toString()],
      productSizes: [new UniqueEntityID("size_id_as_string").toString()],
      productCategories: [
        new UniqueEntityID("category_id_as_string").toString(),
      ],
      materialId: materialId.toString(),
      brandId: brandId.toString(),
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
    };

    console.log(
      `Creating product with materialId: ${materialId.toString()} and brandId: ${brandId.toString()}`
    );
    const result = await useCase.execute(request);
    if (result.isLeft()) {
      console.error("Test Failed:", result.value);
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
      expect(result.value.message).toMatch(
        /Brand not found|Material not found/
      );
    }
    expect(result.isRight()).toBeTruthy();
  });

  it("should return an error if brandId is invalid", async () => {
    const result = await useCase.execute({
      name: "Test Product",
      description: "A test product description",
      productColors: [],
      productSizes: [],
      productCategories: [],
      materialId: materialId.toString(),
      brandId: "invalid_brand_id",
      price: 100,
      stock: 10,
      onSale: false,
      discount: 0,
      isFeatured: false,
      isNew: false,
      images: [],
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
      expect(result.value.message).toBe("Brand not found");
    }
  });

  it("should return an error if materialId is invalid", async () => {
    const result = await useCase.execute({
      name: "Test Product",
      description: "A test product description",
      productColors: [],
      productSizes: [],
      productCategories: [],
      materialId: "invalid_material_id",
      brandId: brandId.toString(),
      price: 100,
      stock: 10,
      onSale: false,
      discount: 0,
      isFeatured: false,
      isNew: false,
      images: [],
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
      expect(result.value.message).toBe("Material not found");
    }
  });

  // it("should fail if required name fields are missing", async () => {
  //   const request = {
  //     name: "",
  //     description: "A test product description",
  //     productColors: [],
  //     productSizes: [],
  //     productCategories: [],
  //     materialId: "1",
  //     brandId: "1",
  //     price: 100,
  //     stock: 10,
  //     onSale: false,
  //     discount: 0,
  //     isFeatured: false,
  //     isNew: false,
  //     images: [],
  //   };
  //   const result = await useCase.execute(request);
  //   expect(result.isLeft()).toBeTruthy();
  //   if (result.isLeft()) {
  //     expect(result.value).toBeInstanceOf(ResourceNotFoundError);

  //     expect(result.value.message).toEqual("Product name is required");
  //   } else {
  //     fail("Expected a Left with an error but got Right");
  //   }
  // });

  it("should not allow negative stock values", async () => {
    const request = {
      name: "Test Product",
      description: "A test product description",
      productColors: [],
      productSizes: [],
      productCategories: [],
      materialId: "1",
      brandId: "1",
      price: 100,
      stock: -1,
      onSale: false,
      discount: 0,
      isFeatured: false,
      isNew: false,
      images: [],
    };
    const result = await useCase.execute(request);

    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);

      expect(result.value.message).toEqual("Stock cannot be negative");
    } else {
      fail("Expected a Left with an error but got Right");
    }
  });

  it("should handle errors when fetching brand data", async () => {
    const request = {
      name: "Test Product",
      description: "A test product description",
      productColors: [],
      productSizes: [],
      productCategories: [],
      materialId: materialId.toString(),
      brandId: "wrong id",
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
      expect(result.value.message).toEqual("Brand not found");
    } else {
      fail("Expected a Left with an error but got Right");
    }
  });

  it("should handle errors when fetching material data", async () => {
    const request = {
      name: "Test Product",
      description: "A test product description",
      productColors: [],
      productSizes: [],
      productCategories: [],
      brandId: brandId.toString(),
      materialId: "definitely wrong id",
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
      expect(result.value.message).toEqual("Material not found");
    } else {
      fail("Expected a Left with an error but got Right");
    }
  });
});
