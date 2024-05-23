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

  let mockColorRepository: IColorRepository;
  let mockProductColorRepository: InMemoryProductColorRepository;

  let mockCategoryRepository: ICategoryRepository;
  let mockProductCategoryRepository: InMemoryProductCategoryRepository;

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
    mockProductColorRepository = new InMemoryProductColorRepository();
    mockBrandRepository = new InMemoryBrandRepository();
    mockMaterialRepository = new InMemoryMaterialRepository();

    mockSizeRepository = new InMemorySizeRepository();
    mockColorRepository = new InMemoryColorRepository();
    mockCategoryRepository = new InMemoryCategoryRepository();

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
        mockProductColorRepository.addItem(
          new ProductColor({
            productId: new UniqueEntityID(productId),
            colorId: new UniqueEntityID(colorId),
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

  it("should create a product with a valid categoryId", async () => {
    const result = await useCase.execute({
      name: "Test Product with Color",
      description: "A test product description",
      productColors: [colorId.toString()],
      productSizes: [sizeId.toString()],
      productCategories: [categoryId.toString()],
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

      const categories = await mockProductCategoryRepository.findByProductId(
        createdProduct.id.toString()
      );

      const product = result.value.product;
      const productId = product.id.toString();

      const variants =
        await mockProductVariantRepository.findByProductId(productId);
      expect(variants).toHaveLength(1);

      expect(categories).toHaveLength(1);
      expect(categories[0].categoryId.toString()).toBe(categoryId.toString());
    } else {
      fail("Expected a Right with the created product but got Left");
    }
  });

  it("should create a product with multiple valid categoryId", async () => {
    const anotherCategoryId = new UniqueEntityID(
      "another_category_Id_as_string"
    );
    const anotherConsistentCategory = makeCategory(
      { name: "Another Test Category Name" },
      anotherCategoryId
    );
    mockCategoryRepository.create(anotherConsistentCategory);

    const result = await useCase.execute({
      name: "Test Product with Multiple Category ",
      description: "A test product description",
      productColors: [colorId.toString()],
      productSizes: [sizeId.toString()],
      productCategories: [categoryId.toString(), anotherCategoryId.toString()],
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
    if (result.isLeft()) {
      throw new Error("Expected product to be created successfully");
    }

    const product = result.value.product;
    const productId = product.id.toString();

    const variants =
      await mockProductVariantRepository.findByProductId(productId);
    expect(variants).toHaveLength(1);

    if (result.isRight()) {
      const createdProduct = result.value.product;
      const categories = mockProductCategoryRepository.items.filter(
        (item) => item.productId.toString() === createdProduct.id.toString()
      );
      expect(categories).toHaveLength(2);
      expect(
        categories.map((category) => category.categoryId.toString())
      ).toEqual(
        expect.arrayContaining([
          categoryId.toString(),
          anotherCategoryId.toString(),
        ])
      );
    } else {
      fail("Expected a Right with the created product but got Left");
    }
  });

  it("should not allow creating a ProductCategory with invalid categoryId", async () => {
    const invalidCategoryId = "Inalid_categoryId";

    const result = await useCase.execute({
      name: "Test Product with inalid category id",
      description: "A test product description",
      productSizes: [],
      productColors: [invalidCategoryId],
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
      expect(result.value.message).toBe(
        `Color not found: ${invalidCategoryId}`
      );
    }
  });

  it("should not allow duplicate categoryId for the same product", async () => {
    const result = await useCase.execute({
      name: "Test Product",
      description: "A test product description",
      productColors: [colorId.toString()],
      productSizes: [sizeId.toString()],
      productCategories: [categoryId.toString(), categoryId.toString()],
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
        `Duplicate category: ${categoryId.toString()}`
      );
    }
  });

  it("should list all categoryId for a given product", async () => {
    const createResult = await useCase.execute({
      name: "Test Product",
      description: "A test product description",
      productColors: [colorId.toString()],
      productSizes: [sizeId.toString()],
      productCategories: [categoryId.toString()],
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
    productId = product.id;

    const categories = await mockProductCategoryRepository.findByProductId(
      productId.toString()
    );
    expect(categories).toHaveLength(1);
    expect(categories[0].categoryId.toString()).toBe(categoryId.toString());
  });

  it("should list all products for a given categoryId", async () => {
    const categoryId = new UniqueEntityID("category_id_as_string").toString();

    // Criando múltiplos produtos com a mesma categoria
    const createResult1 = await useCase.execute({
      name: "Test Product 1",
      description: "A test product description 1",
      productColors: [colorId.toString()],
      productSizes: [sizeId.toString()],
      productCategories: [categoryId],
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

    const createResult2 = await useCase.execute({
      name: "Test Product 2",
      description: "A test product description 2",
      productColors: [colorId.toString()],
      productSizes: [sizeId.toString()],
      productCategories: [categoryId],
      materialId: null,
      brandId: brandId.toString(),
      price: 200,
      stock: 20,
      height: 20,
      width: 20,
      length: 20,
      weight: 20,
      onSale: true,
      discount: 10,
      isFeatured: true,
      isNew: true,
      images: ["image1.jpg", "image2.jpg"],
    });

    if (createResult1.isLeft() || createResult2.isLeft()) {
      throw new Error("Expected products to be created successfully");
    }

    const productsInCategory =
      await mockProductCategoryRepository.findByCategoyId(categoryId);
    const productIds = productsInCategory.map((pc) => pc.productId.toString());

    const variantsInCategory =
      await mockProductVariantRepository.findByProductIds(productIds);

    const variantProductIds = variantsInCategory.map((variant) =>
      variant.productId.toString()
    );

    expect(variantProductIds).toContain(
      createResult1.value.product.id.toString()
    );
    expect(variantProductIds).toContain(
      createResult2.value.product.id.toString()
    );
  });
});
