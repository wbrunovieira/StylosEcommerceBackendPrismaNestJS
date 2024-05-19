import { Test, TestingModule } from "@nestjs/testing";
import { HttpException, HttpStatus } from "@nestjs/common";

import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { RolesGuard } from "@/auth/roles.guard";
import { Reflector } from "@nestjs/core";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import { ExecutionContext } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { vi } from "vitest";

import { makeCategory } from "@test/factories/make-category";
import { CreateCategoryUseCase } from "@/domain/catalog/application/use-cases/create-category";
import { CategoryController } from "./create-category.controller";
import { Category } from "@/domain/catalog/enterprise/entities/category";
import { EditCategoryUseCase } from "@/domain/catalog/application/use-cases/edit-category";

describe("CategoryController", () => {
  let categoryController: CategoryController;
  let createCategoryUseCase: CreateCategoryUseCase;
  let editCategoryUseCase: EditCategoryUseCase;
  //   let findBrandByNameUseCase: FindBrandByNameUseCase;
  //   let getAllBrandsUseCase: GetAllBrandsUseCase;
  //   let findBrandByIdUseCase: FindBrandByIdUseCase;
  //   let deleteBrandUseCase: DeleteBrandUseCase;
  let consoleErrorSpy: any;

  beforeEach(async () => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CreateCategoryUseCase,
          useValue: {
            execute: vi.fn(),
          },
        },
        {
          provide: EditCategoryUseCase,
          useValue: {
            execute: vi.fn(),
          },
        },
        // {
        //   provide: FindBrandByNameUseCase,
        //   useValue: {
        //     execute: vi.fn(),
        //   },
        // },
        // {
        //   provide: GetAllBrandsUseCase,
        //   useValue: {
        //     execute: vi.fn(),
        //   },
        // },
        // {
        //   provide: FindBrandByIdUseCase,
        //   useValue: {
        //     execute: vi.fn(),
        //   },
        // },
        // {
        //   provide: DeleteBrandUseCase,
        //   useValue: {
        //     execute: vi.fn(),
        //   },
        // },
        Reflector,
        {
          provide: JwtAuthGuard,
          useValue: {
            canActivate: (context: ExecutionContext) => {
              const request = context.switchToHttp().getRequest();
              request.user = { role: "admin" };
              return true;
            },
          },
        },
        {
          provide: RolesGuard,
          useValue: {
            canActivate: (context: ExecutionContext) => {
              const request = context.switchToHttp().getRequest();
              request.user = { role: "admin" };
              return true;
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: () => "test-token",
            verify: () => ({ id: "admin-id", role: "admin" }),
          },
        },
      ],
    }).compile();

    categoryController = module.get<CategoryController>(CategoryController);
    createCategoryUseCase = module.get<CreateCategoryUseCase>(
      CreateCategoryUseCase
    );
    editCategoryUseCase = module.get<EditCategoryUseCase>(EditCategoryUseCase);
    // findBrandByNameUseCase = module.get<FindBrandByNameUseCase>(
    //   FindBrandByNameUseCase
    // );
    // getAllBrandsUseCase = module.get<GetAllBrandsUseCase>(GetAllBrandsUseCase);
    // findBrandByIdUseCase =
    //   module.get<FindBrandByIdUseCase>(FindBrandByIdUseCase);
    //   deleteBrandUseCase = module.get<DeleteBrandUseCase>(DeleteBrandUseCase);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("should create a category successfully", async () => {
    const mockCategory = makeCategory({ name: "CategoryName" });

    const mockResult = right({ category: mockCategory }) as Either<
      ResourceNotFoundError | null,
      { category: Category }
    >;
    vi.spyOn(createCategoryUseCase, "execute").mockResolvedValue(mockResult);

    const result = await categoryController.createCategory({
      name: "CategoryName",
    });

    expect(result).toEqual(mockResult.value);
    expect(createCategoryUseCase.execute).toHaveBeenCalledWith({
      name: "CategoryName",
    });
  });

  it("should handle errors thrown by CreateCategoryUseCase", async () => {
    vi.spyOn(createCategoryUseCase, "execute").mockImplementation(() => {
      throw new Error("CreateCategoryUseCase error");
    });

    try {
      await categoryController.createCategory({ name: "CategoryWithError" });
    } catch (error) {
      if (error instanceof HttpException) {
        expect(error.message).toBe("Failed to create category");
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        throw new Error("Expected HttpException");
      }
    }
  });

  it("should edit a category successfully", async () => {
    const mockCategory = makeCategory({ name: "CategoryName" });

    const mockResult = right({ category: mockCategory }) as Either<
      ResourceNotFoundError,
      { category: Category }
    >;
    vi.spyOn(editCategoryUseCase, "execute").mockResolvedValue(mockResult);

    const result = await categoryController.editCategory("category-1", {
      name: "UpdatedCategoryName",
    });

    expect(result).toEqual(mockResult.value);
    expect(editCategoryUseCase.execute).toHaveBeenCalledWith({
      categoryId: "category-1",
      name: "UpdatedCategoryName",
    });
  });

  it("should handle errors thrown by EditCategoryUseCase", async () => {
    vi.spyOn(editCategoryUseCase, "execute").mockImplementation(() => {
      throw new Error("EditCategoryUseCase error");
    });

    try {
      await categoryController.editCategory("category-1", {
        name: "UpdatedCategoryWithError",
      });
    } catch (error) {
      if (error instanceof HttpException) {
        expect(error.message).toBe("Failed to update category");
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        throw new Error("Expected HttpException");
      }
    }
  });

  //   it("should find a brand by name successfully", async () => {
  //     const mockBrand = Brand.create(
  //       {
  //         name: "CategoryName",
  //       },
  //       new UniqueEntityID("brand-1")
  //     );
  //     const mockResult = right({ brand: mockBrand }) as Either<
  //       ResourceNotFoundError,
  //       { brand: Brand }
  //     >;
  //     vi.spyOn(findBrandByNameUseCase, "execute").mockResolvedValue(mockResult);

  //     const result = await categoryController.findBrandByName("CategoryName");

  //     expect(result).toEqual(mockResult.value);
  //     expect(findBrandByNameUseCase.execute).toHaveBeenCalledWith({
  //       name: "CategoryName",
  //     });
  //   });

  //   it("should handle errors thrown by FindBrandByNameUseCase", async () => {
  //     vi.spyOn(findBrandByNameUseCase, "execute").mockImplementation(() => {
  //       throw new Error("FindBrandByNameUseCase error");
  //     });

  //     try {
  //       await categoryController.findBrandByName("CategoryWithError");
  //     } catch (error) {
  //       if (error instanceof HttpException) {
  //         expect(error.message).toBe("Failed to find brand");
  //         expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
  //       } else {
  //         throw new Error("Expected HttpException");
  //       }
  //     }
  //   });

  //   it("should get all brands successfully", async () => {
  //     const mockBrand1 = Brand.create(
  //       {
  //         name: "Brand1",
  //       },
  //       new UniqueEntityID("brand-1")
  //     );

  //     const mockBrand2 = Brand.create(
  //       {
  //         name: "Brand2",
  //       },
  //       new UniqueEntityID("brand-2")
  //     );

  //     const mockResult = right([mockBrand1, mockBrand2]) as Either<
  //       ResourceNotFoundError,
  //       Brand[]
  //     >;

  //     vi.spyOn(getAllBrandsUseCase, "execute").mockResolvedValue(mockResult);

  //     const result = await categoryController.getAllBrands({
  //       page: 1,
  //       pageSize: 10,
  //     });

  //     expect(result).toEqual({ brands: mockResult.value });
  //     expect(getAllBrandsUseCase.execute).toHaveBeenCalledWith({
  //       page: 1,
  //       pageSize: 10,
  //     });
  //   });

  //   it("should handle errors thrown by GetAllBrandsUseCase", async () => {
  //     vi.spyOn(getAllBrandsUseCase, "execute").mockImplementation(() => {
  //       throw new Error("GetAllBrandsUseCase error");
  //     });

  //     try {
  //       await categoryController.getAllBrands({ page: 1, pageSize: 10 });
  //     } catch (error) {
  //       if (error instanceof HttpException) {
  //         expect(error.message).toBe("Failed to retrieve brands");
  //         expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
  //       } else {
  //         throw new Error("Expected HttpException");
  //       }
  //     }
  //   });

  //   it("should find a brand by id successfully", async () => {
  //     const mockCategory = makeCategory();
  //     const mockBrand = Brand.create(
  //       {
  //         name: "CategoryName",
  //       },
  //       new UniqueEntityID("brand-1")
  //     );
  //     const mockResult = right({ brand: mockCategory }) as Either<
  //       ResourceNotFoundError,
  //       { brand: Brand }
  //     >;
  //     vi.spyOn(findBrandByIdUseCase, "execute").mockResolvedValue(mockResult);

  //     const result = await categoryController.findBrandById("brand-1");

  //     expect(result).toEqual(mockResult.value);
  //     expect(findBrandByIdUseCase.execute).toHaveBeenCalledWith({
  //       id: "brand-1",
  //     });
  //   });

  //   it("should handle errors thrown by FindBrandByIdUseCase", async () => {
  //     vi.spyOn(findBrandByIdUseCase, "execute").mockImplementation(() => {
  //       throw new Error("FindBrandByIdUseCase error");
  //     });

  //     try {
  //       await categoryController.findBrandById("CategoryWithError");
  //     } catch (error) {
  //       if (error instanceof HttpException) {
  //         expect(error.message).toBe("Failed to find brand");
  //         expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
  //       } else {
  //         throw new Error("Expected HttpException");
  //       }
  //     }
  //   });

  //   it("should delete a brand successfully", async () => {
  //     const mockResult = right({}) as Either<ResourceNotFoundError, {}>;
  //     vi.spyOn(deleteBrandUseCase, "execute").mockResolvedValue(mockResult);

  //     const result = await categoryController.deleteBrand("brand-1");

  //     expect(result).toEqual({ message: "Brand deleted successfully" });
  //     expect(deleteBrandUseCase.execute).toHaveBeenCalledWith({
  //       brandId: "brand-1",
  //     });
  //   });

  //   it("should handle errors thrown by DeleteBrandUseCase", async () => {
  //     vi.spyOn(deleteBrandUseCase, "execute").mockImplementation(() => {
  //       throw new Error("DeleteBrandUseCase error");
  //     });

  //     try {
  //       await categoryController.deleteBrand("CategoryWithError");
  //     } catch (error) {
  //       if (error instanceof HttpException) {
  //         expect(error.message).toBe("Failed to delete brand");
  //         expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
  //       } else {
  //         throw new Error("Expected HttpException");
  //       }
  //     }
  //   });
});
