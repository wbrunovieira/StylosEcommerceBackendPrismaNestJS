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
import { SizeController } from "./create-size.controller";
import { CreateSizeUseCase } from "@/domain/catalog/application/use-cases/create-size";
import { EditSizeUseCase } from "@/domain/catalog/application/use-cases/edit-size";
import { Size } from "@/domain/catalog/enterprise/entities/size";

describe("SizeController", () => {
  let sizeController: SizeController;
  let createSizeUseCase: CreateSizeUseCase;
  let editsizeUseCase: EditSizeUseCase;
  //   let findBrandByNameUseCase: FindBrandByNameUseCase;
  //   let getAllBrandsUseCase: GetAllBrandsUseCase;
  //   let findBrandByIdUseCase: FindBrandByIdUseCase;
  //   let deleteBrandUseCase: DeleteBrandUseCase;
  let consoleErrorSpy: any;

  beforeEach(async () => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SizeController],
      providers: [
        {
          provide: CreateSizeUseCase,
          useValue: {
            execute: vi.fn(),
          },
        },
        {
          provide: EditSizeUseCase,
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

    sizeController = module.get<SizeController>(SizeController);
    createSizeUseCase = module.get<CreateSizeUseCase>(CreateSizeUseCase);
    editsizeUseCase = module.get<EditSizeUseCase>(EditSizeUseCase);
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

  it("should create a size successfully", async () => {
    const mockSize = Size.create(
      {
        name: "SizeName",
      },
      new UniqueEntityID()
    );
    const mockResult = right({ size: mockSize }) as Either<
      ResourceNotFoundError | null,
      { size: Size }
    >;
    vi.spyOn(createSizeUseCase, "execute").mockResolvedValue(mockResult);

    const result = await sizeController.createSize({ name: "SizeName" });

    expect(result).toEqual(mockResult.value);
    expect(createSizeUseCase.execute).toHaveBeenCalledWith({
      name: "SizeName",
    });
  });

  it("should handle errors thrown by CreateSizeUseCase", async () => {
    vi.spyOn(createSizeUseCase, "execute").mockImplementation(() => {
      throw new Error("CreateSizeUseCase error");
    });

    try {
      await sizeController.createSize({ name: "SizeWithError" });
    } catch (error) {
      if (error instanceof HttpException) {
        expect(error.message).toBe("Failed to create size");
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        throw new Error("Expected HttpException");
      }
    }
  });

  it("should edit a size successfully", async () => {
    const mockSize = Size.create(
      {
        name: "UpdatedSizeName",
      },
      new UniqueEntityID("size-1")
    );
    const mockResult = right({ size: mockSize }) as Either<
      ResourceNotFoundError,
      { size: Size }
    >;
    vi.spyOn(editsizeUseCase, "execute").mockResolvedValue(mockResult);

    const result = await sizeController.editSize("size-1", {
      name: "UpdatedSizeName",
    });

    expect(result).toEqual(mockResult.value);
    expect(editsizeUseCase.execute).toHaveBeenCalledWith({
      sizeId: "size-1",
      name: "UpdatedSizeName",
    });
  });

  it("should handle errors thrown by EditSizeUseCase", async () => {
    vi.spyOn(editsizeUseCase, "execute").mockImplementation(() => {
      throw new Error("EditSizeUseCase error");
    });

    try {
      await sizeController.editSize("size-1", {
        name: "UpdatedBrandWithError",
      });
    } catch (error) {
      if (error instanceof HttpException) {
        expect(error.message).toBe("Failed to update size");
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        throw new Error("Expected HttpException");
      }
    }
  });

  //   it("should find a size by name successfully", async () => {
  //     const mockSize = Size.create(
  //       {
  //         name: "SizeName",
  //       },
  //       new UniqueEntityID("size-1")
  //     );
  //     const mockResult = right({ size: mockSize }) as Either<
  //       ResourceNotFoundError,
  //       { size: Size }
  //     >;
  //     vi.spyOn(findBrandByNameUseCase, "execute").mockResolvedValue(mockResult);

  //     const result = await sizeController.findBrandByName("SizeName");

  //     expect(result).toEqual(mockResult.value);
  //     expect(findBrandByNameUseCase.execute).toHaveBeenCalledWith({
  //       name: "SizeName",
  //     });
  //   });

  //   it("should handle errors thrown by FindBrandByNameUseCase", async () => {
  //     vi.spyOn(findBrandByNameUseCase, "execute").mockImplementation(() => {
  //       throw new Error("FindBrandByNameUseCase error");
  //     });

  //     try {
  //       await sizeController.findBrandByName("SizeWithError");
  //     } catch (error) {
  //       if (error instanceof HttpException) {
  //         expect(error.message).toBe("Failed to find size");
  //         expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
  //       } else {
  //         throw new Error("Expected HttpException");
  //       }
  //     }
  //   });

  //   it("should get all brands successfully", async () => {
  //     const mockBrand1 = Size.create(
  //       {
  //         name: "Brand1",
  //       },
  //       new UniqueEntityID("size-1")
  //     );

  //     const mockBrand2 = Size.create(
  //       {
  //         name: "Brand2",
  //       },
  //       new UniqueEntityID("size-2")
  //     );

  //     const mockResult = right([mockBrand1, mockBrand2]) as Either<
  //       ResourceNotFoundError,
  //       Size[]
  //     >;

  //     vi.spyOn(getAllBrandsUseCase, "execute").mockResolvedValue(mockResult);

  //     const result = await sizeController.getAllBrands({
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
  //       await sizeController.getAllBrands({ page: 1, pageSize: 10 });
  //     } catch (error) {
  //       if (error instanceof HttpException) {
  //         expect(error.message).toBe("Failed to retrieve brands");
  //         expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
  //       } else {
  //         throw new Error("Expected HttpException");
  //       }
  //     }
  //   });

  //   it("should find a size by id successfully", async () => {
  //     const mockSize = Size.create(
  //       {
  //         name: "SizeName",
  //       },
  //       new UniqueEntityID("size-1")
  //     );
  //     const mockResult = right({ size: mockSize }) as Either<
  //       ResourceNotFoundError,
  //       { size: Size }
  //     >;
  //     vi.spyOn(findBrandByIdUseCase, "execute").mockResolvedValue(mockResult);

  //     const result = await sizeController.findBrandById("size-1");

  //     expect(result).toEqual(mockResult.value);
  //     expect(findBrandByIdUseCase.execute).toHaveBeenCalledWith({
  //       id: "size-1",
  //     });
  //   });

  //   it("should handle errors thrown by FindBrandByIdUseCase", async () => {
  //     vi.spyOn(findBrandByIdUseCase, "execute").mockImplementation(() => {
  //       throw new Error("FindBrandByIdUseCase error");
  //     });

  //     try {
  //       await sizeController.findBrandById("BrandWithError");
  //     } catch (error) {
  //       if (error instanceof HttpException) {
  //         expect(error.message).toBe("Failed to find size");
  //         expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
  //       } else {
  //         throw new Error("Expected HttpException");
  //       }
  //     }
  //   });

  //   it("should delete a size successfully", async () => {
  //     const mockResult = right({}) as Either<
  //       ResourceNotFoundError,
  //       {}
  //     >;
  //     vi.spyOn(deleteBrandUseCase, "execute").mockResolvedValue(mockResult);

  //     const result = await sizeController.deleteBrand("size-1");

  //     expect(result).toEqual({ message: "Size deleted successfully" });
  //     expect(deleteBrandUseCase.execute).toHaveBeenCalledWith({
  //       sizeId: "size-1",
  //     });
  //   });

  //   it("should handle errors thrown by DeleteBrandUseCase", async () => {
  //     vi.spyOn(deleteBrandUseCase, "execute").mockImplementation(() => {
  //       throw new Error("DeleteBrandUseCase error");
  //     });

  //     try {
  //       await sizeController.deleteBrand("BrandWithError");
  //     } catch (error) {
  //       if (error instanceof HttpException) {
  //         expect(error.message).toBe("Failed to delete size");
  //         expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
  //       } else {
  //         throw new Error("Expected HttpException");
  //       }
  //     }
  //   });
});
