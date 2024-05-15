import { Test, TestingModule } from "@nestjs/testing";
import { HttpException, HttpStatus } from "@nestjs/common";
import { BrandController } from "./create-brand.controller";
import { CreateBrandUseCase } from "@/domain/catalog/application/use-cases/create-brand";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { vi } from "vitest";

import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Brand } from "@/domain/catalog/enterprise/entities/brand";

describe("BrandController", () => {
  let brandController: BrandController;
  let createBrandUseCase: CreateBrandUseCase;
  let consoleErrorSpy: any;

  beforeEach(async () => {

    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BrandController],
      providers: [
        {
          provide: CreateBrandUseCase,
          useValue: {
            execute: vi.fn(),
          },
        },
      ],

    }).compile();

    brandController = module.get<BrandController>(BrandController);
    createBrandUseCase = module.get<CreateBrandUseCase>(CreateBrandUseCase);
  });
  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("should create a brand successfully", async () => {
    const mockBrand = Brand.create(
      {
        name: "BrandName",
      },
      new UniqueEntityID()
    );
    const mockResult = right({ brand: mockBrand }) as Either<
      ResourceNotFoundError | null,
      { brand: Brand }
    >;
    vi.spyOn(createBrandUseCase, "execute").mockResolvedValue(mockResult);

    const result = await brandController.createBrand({ name: "BrandName" });

    expect(result).toEqual(mockResult.value);
    expect(createBrandUseCase.execute).toHaveBeenCalledWith({
      name: "BrandName",
    });
  });

  it("should handle errors thrown by CreateBrandUseCase", async () => {
    vi.spyOn(createBrandUseCase, "execute").mockImplementation(() => {
      throw new Error("CreateBrandUseCase error");
    });

    try {
      await brandController.createBrand({ name: "BrandWithError" });
    } catch (error) {
      if (error instanceof HttpException) {
        expect(error.message).toBe("Failed to create brand");
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        throw new Error("Expected HttpException");
      }
    }
  });

  it("should handle ResourceNotFoundError", async () => {
    const mockError = left(new ResourceNotFoundError("Brand not found"));
    vi.spyOn(createBrandUseCase, "execute").mockImplementation(() => {
      throw new Error("CreateBrandUseCase error");
    });

    try {
      await brandController.createBrand({ name: "NonExistentBrand" });
    } catch (error) {
      if (error instanceof HttpException) {
        expect(error.message).toBe("Failed to create brand");
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        throw new Error("Expected HttpException");
      }
    }
  });
});
