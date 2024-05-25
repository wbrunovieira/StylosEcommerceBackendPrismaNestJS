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
import { ISizeRepository } from "../repositories/i-size-repository";
import { makeSize } from "@test/factories/make-size";
import { InMemorySizeRepository } from "@test/repositories/in-memory-size-repository";
import { ProductSize } from "../../enterprise/entities/product-size";
import { makeColor } from "@test/factories/make-color";
import { ProductColor } from "../../enterprise/entities/product-color";
import { ICategoryRepository } from "../repositories/i-category-repository";
import { makeCategory } from "@test/factories/make-category";
import { InMemoryCategoryRepository } from "@test/repositories/in-memory-category-repository";
import { ProductCategory } from "../../enterprise/entities/product-category";
import { IProductVariantRepository } from "../repositories/i-product-variant-repository";
import { InMemoryProductVariantRepository } from "@test/repositories/in-memory-product-variant-repository";

describe("CreateProductUseCase", () => {
  let useCase: CreateProductUseCase;
  let mockProductRepository: IProductRepository;
  let mockProductVariantRepository: IProductVariantRepository;

  let mockBrandRepository: IBrandRepository;
  let mockMaterialRepository: IMaterialRepository;

  let mockSizeRepository: ISizeRepository;
  let mockProductSizeRepository: InMemoryProductSizeRepository;

  let mockColorRepository: InMemoryColorRepository;
  let mockProductColorRepository: InMemoryProductColorRepository;

  let mockCategoryRepository: ICategoryRepository;
  let mockProductCategoryRepository: IProductCategoryRepository;

  let brandId: UniqueEntityID;
  let materialId: UniqueEntityID;
  let sizeId: UniqueEntityID;
  let colorId: UniqueEntityID;
  let categoryId: UniqueEntityID;
  let productId: UniqueEntityID;

  beforeEach(() => {
    brandId = new UniqueEntityID("82a6d71c-6378-4d11-8258-4ee8732161a3");
    materialId = new UniqueEntityID("f056524a-85bf-45a9-bf40-ebade896343c");
    sizeId = new UniqueEntityID("size_id_as_string");
    colorId = new UniqueEntityID("color_id_as_string");
    categoryId = new UniqueEntityID("category_id_as_string");

    const consistentBrand = makeBrand({ name: "Test Brand Name" }, brandId);
    const consistentMaterial = makeMaterial(
      { name: "Test Material Name" },
      materialId
    );
    const consistentSize = makeSize({ name: "Test Size Name" }, sizeId);
    const consistentColor = makeColor({ name: "Test Color Name" }, colorId);
    const consistentCategory = makeCategory(
      { name: "Test Category Name" },
      categoryId
    );

    mockProductRepository = new InMemoryProductRepository();
    mockProductVariantRepository = new InMemoryProductVariantRepository();

    mockProductSizeRepository = new InMemoryProductSizeRepository();
    mockProductCategoryRepository = new InMemoryProductCategoryRepository();

    mockProductCategoryRepository = new InMemoryProductCategoryRepository();

    mockBrandRepository = new InMemoryBrandRepository();
    mockMaterialRepository = new InMemoryMaterialRepository();

    mockSizeRepository = new InMemorySizeRepository();
    mockColorRepository = new InMemoryColorRepository();
    mockCategoryRepository = new InMemoryCategoryRepository();

    mockProductColorRepository = new InMemoryProductColorRepository(
      mockColorRepository
    );
    mockBrandRepository.create(consistentBrand);
    mockMaterialRepository.create(consistentMaterial);
    mockSizeRepository.create(consistentSize);
    mockColorRepository.create(consistentColor);
    mockCategoryRepository.create(consistentCategory);

    useCase = new CreateProductUseCase(
      mockProductRepository,
      mockColorRepository,
      mockBrandRepository,
      mockMaterialRepository,
      mockSizeRepository,
      mockCategoryRepository,
      mockProductSizeRepository,
      mockProductColorRepository,
      mockProductCategoryRepository,
      mockProductVariantRepository
    );

    mockBrandRepository.findById = vi.fn((id) => {
      return id === brandId.toString()
        ? Promise.resolve(right(consistentBrand))
        : Promise.resolve(left(new ResourceNotFoundError("Brand not found")));
    });

    mockMaterialRepository.findById = vi.fn((id) => {
      return id === materialId.toString()
        ? Promise.resolve(right(consistentMaterial))
        : Promise.resolve(
            left(new ResourceNotFoundError("Material not found"))
          );
    });

    mockProductSizeRepository.addItem(
      new ProductSize({
        productId: new UniqueEntityID("existing_product_id"),
        sizeId: sizeId,
      })
    );

    mockProductSizeRepository.findByProductId = vi.fn((productId) => {
      return Promise.resolve(
        mockProductSizeRepository.items.filter(
          (item) => item.productId.toString() === productId
        )
      );
    });

    mockProductColorRepository.create = vi.fn(
      (productId: string, colorId: string) => {
        const now = new Date();
        mockProductColorRepository.addItem(
          new ProductColor({
            productId: new UniqueEntityID(productId),
            colorId: new UniqueEntityID(colorId),
            createdAt: now,
            updatedAt: now,
          })
        );
        return Promise.resolve(right(undefined));
      }
    );

    mockProductCategoryRepository.create = vi.fn(
      (productId: string, categoryId: string) => {
        mockProductCategoryRepository.addItem(
          new ProductCategory({
            productId: new UniqueEntityID(productId),
            categoryId: new UniqueEntityID(categoryId),
          })
        );
        return Promise.resolve(right(undefined));
      }
    );
  });

  it("should create a product with a valid colorId and sizeId", async () => {
    const result = await useCase.execute({
      name: "Test Product with Color and Size",
      description: "A test product description",
      productColors: [colorId.toString()],
      productSizes: [sizeId.toString()],
      productCategories: [],
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
    });

    expect(result.isRight()).toBeTruthy();

    if (result.isRight()) {
      const createdProduct = result.value.product;

      const variants = await mockProductVariantRepository.findByProductId(
        createdProduct.id.toString()
      );

      expect(variants).toHaveLength(1);
      if (variants && variants[0]) {
        const variant = variants[0];
        if (variant.colorId && variant.sizeId) {
          expect(variant.colorId.toString()).toBe(colorId.toString());
          expect(variant.sizeId.toString()).toBe(sizeId.toString());
        } else {
          fail("Expected variant to have valid colorId and sizeId");
        }
      }
    } else {
      fail("Expected a Right with the created product but got Left");
    }
  });

  it("should create a product with multiple valid colorId", async () => {
    const anotherColorId = new UniqueEntityID("another_color_id_as_string");
    const anotherConsistentColor = makeColor(
      { name: "Another Test Color Name" },
      anotherColorId
    );
    mockColorRepository.create(anotherConsistentColor);

    const result = await useCase.execute({
      name: "Test Product with Multiple Colors",
      description: "A test product description",
      productColors: [colorId.toString(), anotherColorId.toString()],
      productSizes: [sizeId.toString()],
      productCategories: [],
      materialId: materialId.toString(),
      brandId: brandId.toString(),
      price: 250,
      stock: 25,
      height: 3,
      width: 3,
      length: 3,
      weight: 3,
      onSale: true,
      discount: 15,
      isFeatured: true,
      isNew: true,
      images: ["image1.jpg", "image2.jpg"],
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      const createdProduct = result.value.product;
      const colors = mockProductColorRepository.items.filter(
        (item) => item.productId.toString() === createdProduct.id.toString()
      );
      expect(colors).toHaveLength(2);
      expect(colors.map((color) => color.colorId.toString())).toEqual(
        expect.arrayContaining([colorId.toString(), anotherColorId.toString()])
      );

      const variants = await mockProductVariantRepository.findByProductId(
        createdProduct.id.toString()
      );

      expect(variants).toHaveLength(2);
      const colorIds = variants.map((variant) => variant.colorId?.toString());
      const sizeIds = variants.map((variant) => variant.sizeId?.toString());

      expect(colorIds).toEqual(
        expect.arrayContaining([colorId.toString(), anotherColorId.toString()])
      );
      expect(sizeIds).toEqual(
        expect.arrayContaining([sizeId.toString(), sizeId.toString()])
      );
    } else {
      fail("Expected a Right with the created product but got Left");
    }
  });

  it("should not allow creating a ProductColor with invalid colorId", async () => {
    const invalidColorId = "invalid_color_id";

    const result = await useCase.execute({
      name: "Test Product with invalid color id",
      description: "A test product description",
      productSizes: [],
      productColors: [invalidColorId],
      productCategories: [],
      materialId: materialId.toString(),
      brandId: brandId.toString(),
      price: 250,
      stock: 25,
      height: 3,
      width: 3,
      length: 3,
      weight: 3,
      onSale: true,
      discount: 15,
      isFeatured: true,
      isNew: true,
      images: ["image1.jpg", "image2.jpg"],
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value.message).toBe(`Color not found: ${invalidColorId}`);

      if (mockProductRepository instanceof InMemoryProductRepository) {
        const createdProduct = mockProductRepository.items.find(
          (product) => product.name === "Test Product with invalid color id"
        );

        if (createdProduct) {
          const variants = await mockProductVariantRepository.findByProductId(
            createdProduct.id.toString()
          );
          expect(variants).toHaveLength(0);
        } else {
          expect(createdProduct).toBeUndefined();
        }
      }
    }
  });

  it("should not allow duplicate colors for the same product", async () => {
    const result = await useCase.execute({
      name: "Test Product",
      description: "A test product description",
      productColors: [colorId.toString(), colorId.toString()],
      productSizes: [sizeId.toString()],
      productCategories: [],
      materialId: null,
      brandId: brandId.toString(),
      price: 100,
      stock: 10,
      height: 10,
      width: 10,
      length: 10,
      weight: 10,
      onSale: false,
      discount: 0,
      isFeatured: false,
      isNew: false,
      images: [],
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value.message).toBe(
        `Duplicate color: ${colorId.toString()}`
      );

      if (mockProductRepository instanceof InMemoryProductRepository) {
        const createdProduct = mockProductRepository.items.find(
          (product) => product.name === "Test Product"
        );
        if (createdProduct) {
          const variants = await mockProductVariantRepository.findByProductId(
            createdProduct.id.toString()
          );
          expect(variants).toHaveLength(0);
        }
      }
    }
  });

  it("should list all colors for a given product", async () => {
    const createResult = await useCase.execute({
      name: "Test Product",
      description: "A test product description",
      productColors: [colorId.toString()],
      productSizes: [sizeId.toString()],
      productCategories: [],
      materialId: null,
      brandId: brandId.toString(),
      price: 100,
      stock: 10,
      height: 10,
      width: 10,
      length: 10,
      weight: 10,
      onSale: false,
      discount: 0,
      isFeatured: false,
      isNew: false,
      images: [],
    });

    if (createResult.isLeft()) {
      throw new Error("Expected product to be created successfully");
    }

    const product = createResult.value.product;
    const productId = product.id.toString();

    const colors = await mockProductColorRepository.findByProductId(
      productId.toString()
    );
    expect(colors).toHaveLength(1);
    expect(colors[0].colorId?.toString()).toBe(colorId.toString());

    const variants =
      await mockProductVariantRepository.findByProductId(productId);
    expect(variants).toHaveLength(1);
    expect(variants[0].colorId?.toString()).toBe(colorId.toString());
    expect(variants[0].sizeId?.toString()).toBe(sizeId.toString());
  });

  it("should create a product with two colors and two sizes and create four variants", async () => {
    const anotherColorId = new UniqueEntityID("another_color_id_as_string");
    const anotherSizeId = new UniqueEntityID("another_size_id_as_string");

    const anotherConsistentColor = makeColor(
      { name: "Another Test Color Name" },
      anotherColorId
    );
    const anotherConsistentSize = makeSize(
      { name: "Another Test Size Name" },
      anotherSizeId
    );

    mockColorRepository.create(anotherConsistentColor);
    mockSizeRepository.create(anotherConsistentSize);

    const result = await useCase.execute({
      name: "Test Product with Multiple Colors and Sizes",
      description: "A test product description",
      productColors: [colorId.toString(), anotherColorId.toString()],
      productSizes: [sizeId.toString(), anotherSizeId.toString()],
      productCategories: [],
      materialId: null,
      brandId: brandId.toString(),
      price: 100,
      stock: 10,
      height: 10,
      width: 10,
      length: 10,
      weight: 10,
      onSale: false,
      discount: 0,
      isFeatured: false,
      isNew: false,
      images: [],
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      const createdProduct = result.value.product;
      const productId = createdProduct.id.toString();

      const variants =
        await mockProductVariantRepository.findByProductId(productId);
      expect(variants).toHaveLength(4);

      const expectedVariants = [
        { colorId: colorId.toString(), sizeId: sizeId.toString() },
        { colorId: colorId.toString(), sizeId: anotherSizeId.toString() },
        { colorId: anotherColorId.toString(), sizeId: sizeId.toString() },
        {
          colorId: anotherColorId.toString(),
          sizeId: anotherSizeId.toString(),
        },
      ];

      expectedVariants.forEach((expectedVariant) => {
        const variant = variants.find(
          (v) =>
            v.colorId?.toString() === expectedVariant.colorId &&
            v.sizeId?.toString() === expectedVariant.sizeId
        );
        expect(variant).toBeDefined();
      });
    } else {
      fail("Expected a Right with the created product but got Left");
    }
  });
});
