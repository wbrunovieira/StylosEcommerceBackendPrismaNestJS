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
import { EditColorUseCase } from "@/domain/catalog/application/use-cases/edit-color";
import { FindColorByIdUseCase } from "@/domain/catalog/application/use-cases/find-color-by-id";
import { FindColorByNameUseCase } from "@/domain/catalog/application/use-cases/find-color-by-name";

describe("ColorController", () => {
  let colorController: ColorsController;
  let createColorUseCase: CreateColorUseCase;
  let editColorUseCase: EditColorUseCase;
  let findColorByNameUseCase: FindColorByNameUseCase;
  //   let getAllBrandsUseCase: GetAllBrandsUseCase;
  let findColorByIdUseCase: FindColorByIdUseCase;
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
        {
          provide: EditColorUseCase,
          useValue: {
            execute: vi.fn(),
          },
        },
        {
          provide: FindColorByNameUseCase,
          useValue: {
            execute: vi.fn(),
          },
        },
        // {
        //   provide: GetAllBrandsUseCase,
        //   useValue: {
        //     execute: vi.fn(),
        //   },
        // },
        {
          provide: FindColorByIdUseCase,
          useValue: {
            execute: vi.fn(),
          },
        },
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
    editColorUseCase = module.get<EditColorUseCase>(EditColorUseCase);
    findColorByNameUseCase = module.get<FindColorByNameUseCase>(
      FindColorByNameUseCase
    );
    // getAllBrandsUseCase = module.get<GetAllBrandsUseCase>(GetAllBrandsUseCase);
    findColorByIdUseCase =
      module.get<FindColorByIdUseCase>(FindColorByIdUseCase);
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

  it("should edit a color successfully", async () => {
    const mockColor = Color.create(
      {
        name: "UpdatedColorName",
      },
      new UniqueEntityID("color-1")
    );
    const mockResult = right({ color: mockColor }) as Either<
      ResourceNotFoundError,
      { color: Color }
    >;
    vi.spyOn(editColorUseCase, "execute").mockResolvedValue(mockResult);

    const result = await colorController.editColor("color-1", {
      name: "UpdatedColorName",
    });

    expect(result).toEqual(mockResult.value);
    expect(editColorUseCase.execute).toHaveBeenCalledWith({
      colorId: "color-1",
      name: "UpdatedColorName",
    });
  });

  it("should handle errors thrown by EditColorUseCase", async () => {
    vi.spyOn(editColorUseCase, "execute").mockImplementation(() => {
      throw new Error("EditColorUseCase error");
    });

    try {
      await colorController.editColor("color-1", {
        name: "UpdatedColorWithError",
      });
    } catch (error) {
      if (error instanceof HttpException) {
        expect(error.message).toBe("Failed to update color");
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        throw new Error("Expected HttpException");
      }
    }
  });

  it("should find a color by name successfully", async () => {
    const mockColor = Color.create(
      {
        name: "ColorName",
      },
      new UniqueEntityID("color-1")
    );
    const mockResult = right({ color: mockColor }) as Either<
      ResourceNotFoundError,
      { color: Color }
    >;
    vi.spyOn(findColorByNameUseCase, "execute").mockResolvedValue(mockResult);

    const result = await colorController.findColorByName("ColorName");

    expect(result).toEqual(mockResult.value);
    expect(findColorByNameUseCase.execute).toHaveBeenCalledWith({
      name: "ColorName",
    });
  });

  it("should handle errors thrown by FindColorByNameUseCase", async () => {
    vi.spyOn(findColorByNameUseCase, "execute").mockImplementation(() => {
      throw new Error("FindColorByNameUseCase error");
    });

    try {
      await colorController.findColorByName("ColorWithError");
    } catch (error) {
      if (error instanceof HttpException) {
        expect(error.message).toBe("Failed to find color");
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        throw new Error("Expected HttpException");
      }
    }
  });

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

  it("should find a Color by id successfully", async () => {
    const mockColor = Color.create(
      {
        name: "ColorName",
      },
      new UniqueEntityID("color-1")
    );
    const mockResult = right({ color: mockColor }) as Either<
      ResourceNotFoundError,
      { color: Color }
    >;
    vi.spyOn(findColorByIdUseCase, "execute").mockResolvedValue(mockResult);

    const result = await colorController.findColorById("color-1");

    expect(result).toEqual(mockResult.value);
    expect(findColorByIdUseCase.execute).toHaveBeenCalledWith({
      id: "color-1",
    });
  });

  it("should handle errors thrown by FindColorByIdUseCase", async () => {
    vi.spyOn(findColorByIdUseCase, "execute").mockImplementation(() => {
      throw new Error("FindColorByIdUseCase error");
    });

    try {
      await colorController.findColorById("ColorWithError");
    } catch (error) {
      if (error instanceof HttpException) {
        expect(error.message).toBe("Failed to find color");
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        throw new Error("Expected HttpException");
      }
    }
  });

  //   it("should delete a color successfully", async () => {
  //     const mockResult = right({}) as Either<ResourceNotFoundError, {}>;
  //     vi.spyOn(deleteBrandUseCase, "execute").mockResolvedValue(mockResult);

  //     const result = await colorController.deleteBrand("color-1");

  //     expect(result).toEqual({ message: "Brand deleted successfully" });
  //     expect(deleteBrandUseCase.execute).toHaveBeenCalledWith({
  //       brandId: "color-1",
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
