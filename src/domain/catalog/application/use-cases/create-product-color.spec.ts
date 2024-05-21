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

describe("CreateProductUseCase", () => {
  let useCase: CreateProductUseCase;

  let mockProductRepository: IProductRepository;

  let mockBrandRepository: IBrandRepository;
  let mockMaterialRepository: IMaterialRepository;

  let mockSizeRepository: ISizeRepository;
  let mockProductSizeRepository: InMemoryProductSizeRepository;

  let mockColorRepository: IColorRepository;
  let mockProductColorRepository: InMemoryProductColorRepository;

  let brandId: UniqueEntityID;
  let materialId: UniqueEntityID;
  let sizeId: UniqueEntityID;
  let colorId: UniqueEntityID;
  let productId: UniqueEntityID;

  beforeEach(() => {
    brandId = new UniqueEntityID("82a6d71c-6378-4d11-8258-4ee8732161a3");
    materialId = new UniqueEntityID("f056524a-85bf-45a9-bf40-ebade896343c");
    sizeId = new UniqueEntityID("size_id_as_string");
    colorId = new UniqueEntityID("color_id_as_string");
    productId = new UniqueEntityID("product_id_as_string");

    const consistentBrand = makeBrand({ name: "Test Brand Name" }, brandId);

    const consistentMaterial = makeMaterial(
      { name: "Test Material Name" },
      materialId
    );

    const consistentSize = makeSize({ name: "Test Size Name" }, sizeId);

    const consistentColor = makeColor({ name: "Test Color Name" }, colorId);

    mockProductRepository = new InMemoryProductRepository();
    mockSizeRepository = new InMemorySizeRepository();
    mockProductSizeRepository = new InMemoryProductSizeRepository();
    mockBrandRepository = new InMemoryBrandRepository();
    mockMaterialRepository = new InMemoryMaterialRepository();
    mockProductColorRepository = new InMemoryProductColorRepository();

    mockBrandRepository.create(consistentBrand);
    mockMaterialRepository.create(consistentMaterial);
    mockSizeRepository.create(consistentSize);
    mockColorRepository.create(consistentColor);

    useCase = new CreateProductUseCase(
      mockProductRepository,
      mockColorRepository,
      mockBrandRepository,
      mockMaterialRepository,
      mockSizeRepository,
      mockProductSizeRepository,
      mockProductColorRepository
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
      console.log(`FindById ProductSize called with: ${productId}`);
      return Promise.resolve(
        mockProductSizeRepository.items.filter(
          (item) => item.productId.toString() === productId
        )
      );
    });

    mockProductColorRepository.addItem(
      new ProductColor({
        productId: new UniqueEntityID("existing_product_id"),
        colorId: colorId,
      })
    );

    mockProductColorRepository.findByProductId = vi.fn((colorId) => {
      console.log(`FindById ProductColor called with: ${colorId}`);
      return Promise.resolve(
        mockProductColorRepository.items.filter(
          (item) => item.colorId.toString() === colorId
        )
      );
    });
  });
});
