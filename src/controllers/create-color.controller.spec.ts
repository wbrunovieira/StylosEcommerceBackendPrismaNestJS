import { Test, TestingModule } from "@nestjs/testing";
import { HttpException, HttpStatus } from "@nestjs/common";
import { ColorsController } from "./create-colors.controller";

import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { RolesGuard } from "@/auth/roles.guard";
import { Reflector } from "@nestjs/core";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import { ExecutionContext } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { vi } from "vitest";

import { CreateColorUseCase } from "@/domain/catalog/application/use-cases/create-color";
import { Color } from "@/domain/catalog/enterprise/entities/color";

describe("ColorController", () => {
  let colorController: ColorsController;
  let createColorUseCase: CreateColorUseCase;
  //   let editBrandUseCase: EditBrandUseCase;
  //   let findBrandByNameUseCase: FindBrandByNameUseCase;
  //   let getAllBrandsUseCase: GetAllBrandsUseCase;
  //   let findBrandByIdUseCase: FindBrandByIdUseCase;
  //   let deleteBrandUseCase: DeleteBrandUseCase;
  let consoleErrorSpy: any;

  beforeEach(async () => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ColorsController],
      providers: [
        {
          provide: CreateColorUseCase,
          useValue: {
            execute: vi.fn(),
          },
        },
        // {
        //   provide: EditBrandUseCase,
        //   useValue: {
        //     execute: vi.fn(),
        //   },
        // },
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

    colorController = module.get<ColorsController>(ColorsController);
    createColorUseCase = module.get<CreateColorUseCase>(CreateColorUseCase);
    // editBrandUseCase = module.get<EditBrandUseCase>(EditBrandUseCase);
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

  it("should create a color successfully", async () => {
    const mockColor = Color.create(
      {
        name: "ColorName",
      },
      new UniqueEntityID()
    );
    const mockResult = right({ color: mockColor }) as Either<
      ResourceNotFoundError | null,
      { color: Color }
    >;
    vi.spyOn(createColorUseCase, "execute").mockResolvedValue(mockResult);

    const result = await colorController.createColor({ name: "ColorName" });

    expect(result).toEqual(mockResult.value);
    expect(createColorUseCase.execute).toHaveBeenCalledWith({
      name: "ColorName",
    });
  });

  it("should handle errors thrown by CreateColorUseCase", async () => {
    vi.spyOn(createColorUseCase, "execute").mockImplementation(() => {
      throw new Error("CreateColorUseCase error");
    });

    try {
      await colorController.createColor({ name: "ColorWithError" });
    } catch (error) {
      if (error instanceof HttpException) {
        expect(error.message).toBe("Failed to create color");
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        throw new Error("Expected HttpException");
      }
    }
  });

  //   it("should edit a color successfully", async () => {
  //     const mockBrand = Color.create(
  //       {
  //         name: "UpdatedBrandName",
  //       },
  //       new UniqueEntityID("color-1")
  //     );
  //     const mockResult = right({ brand: mockBrand }) as Either<
  //       ResourceNotFoundError,
  //       { brand: Brand }
  //     >;
  //     vi.spyOn(editBrandUseCase, "execute").mockResolvedValue(mockResult);

  //     const result = await colorController.editBrand("color-1", {
  //       name: "UpdatedBrandName",
  //     });

  //     expect(result).toEqual(mockResult.value);
  //     expect(editBrandUseCase.execute).toHaveBeenCalledWith({
  //       brandId: "color-1",
  //       name: "UpdatedBrandName",
  //     });
  //   });

  //   it("should handle errors thrown by EditBrandUseCase", async () => {
  //     vi.spyOn(editBrandUseCase, "execute").mockImplementation(() => {
  //       throw new Error("EditBrandUseCase error");
  //     });

  //     try {
  //       await colorController.editBrand("color-1", {
  //         name: "UpdatedBrandWithError",
  //       });
  //     } catch (error) {
  //       if (error instanceof HttpException) {
  //         expect(error.message).toBe("Failed to update color");
  //         expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
  //       } else {
  //         throw new Error("Expected HttpException");
  //       }
  //     }
  //   });

  //   it("should find a color by name successfully", async () => {
  //     const mockBrand = Brand.create(
  //       {
  //         name: "ColorName",
  //       },
  //       new UniqueEntityID("color-1")
  //     );
  //     const mockResult = right({ brand: mockBrand }) as Either<
  //       ResourceNotFoundError,
  //       { brand: Brand }
  //     >;
  //     vi.spyOn(findBrandByNameUseCase, "execute").mockResolvedValue(mockResult);

  //     const result = await colorController.findBrandByName("ColorName");

  //     expect(result).toEqual(mockResult.value);
  //     expect(findBrandByNameUseCase.execute).toHaveBeenCalledWith({
  //       name: "ColorName",
  //     });
  //   });

  //   it("should handle errors thrown by FindBrandByNameUseCase", async () => {
  //     vi.spyOn(findBrandByNameUseCase, "execute").mockImplementation(() => {
  //       throw new Error("FindBrandByNameUseCase error");
  //     });

  //     try {
  //       await colorController.findBrandByName("ColorWithError");
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

  //     const result = await colorController.getAllBrands({
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
  //       await colorController.getAllBrands({ page: 1, pageSize: 10 });
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
  //     const mockBrand = Brand.create(
  //       {
  //         name: "BrandName",
  //       },
  //       new UniqueEntityID("brand-1")
  //     );
  //     const mockResult = right({ brand: mockBrand }) as Either<
  //       ResourceNotFoundError,
  //       { brand: Brand }
  //     >;
  //     vi.spyOn(findBrandByIdUseCase, "execute").mockResolvedValue(mockResult);

  //     const result = await colorController.findBrandById("brand-1");

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
  //       await colorController.findBrandById("ColorWithError");
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

  //     const result = await colorController.deleteBrand("brand-1");

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
  //       await colorController.deleteBrand("BrandWithError");
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
