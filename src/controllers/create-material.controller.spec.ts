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

import { MaterialController } from "./create-material.controller";
import { CreateMaterialUseCase } from "@/domain/catalog/application/use-cases/create-material";
import { Material } from "@/domain/catalog/enterprise/entities/material";
import { EditMaterialUseCase } from "@/domain/catalog/application/use-cases/edit-material";
import { FindMaterialByNameUseCase } from "@/domain/catalog/application/use-cases/find-material-by-name";

describe("MaterialController", () => {
  let materialController: MaterialController;
  let createMaterialUseCase: CreateMaterialUseCase;
  let editMaterialUseCase: EditMaterialUseCase;
  let findMaterialByNameUseCase: FindMaterialByNameUseCase;
  //   let getAllBrandsUseCase: GetAllBrandsUseCase;
  //   let findBrandByIdUseCase: FindBrandByIdUseCase;
  //   let deleteBrandUseCase: DeleteBrandUseCase;
  let consoleErrorSpy: any;

  beforeEach(async () => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaterialController],
      providers: [
        {
          provide: CreateMaterialUseCase,
          useValue: {
            execute: vi.fn(),
          },
        },
        {
          provide: EditMaterialUseCase,
          useValue: {
            execute: vi.fn(),
          },
        },
        {
          provide: FindMaterialByNameUseCase,
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

    materialController = module.get<MaterialController>(MaterialController);
    createMaterialUseCase = module.get<CreateMaterialUseCase>(
      CreateMaterialUseCase
    );
    editMaterialUseCase = module.get<EditMaterialUseCase>(EditMaterialUseCase);
    findMaterialByNameUseCase = module.get<FindMaterialByNameUseCase>(
      FindMaterialByNameUseCase
    );
    // getAllBrandsUseCase = module.get<GetAllBrandsUseCase>(GetAllBrandsUseCase);
    // findBrandByIdUseCase =
    //   module.get<FindBrandByIdUseCase>(FindBrandByIdUseCase);
    //   deleteBrandUseCase = module.get<DeleteBrandUseCase>(DeleteBrandUseCase);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("should create a material successfully", async () => {
    const mockMaterial = Material.create(
      {
        name: "MaterialName",
      },
      new UniqueEntityID()
    );
    const mockResult = right({ material: mockMaterial }) as Either<
      ResourceNotFoundError | null,
      { material: Material }
    >;
    vi.spyOn(createMaterialUseCase, "execute").mockResolvedValue(mockResult);

    const result = await materialController.createMaterial({
      name: "MaterialName",
    });

    expect(result).toEqual(mockResult.value);
    expect(createMaterialUseCase.execute).toHaveBeenCalledWith({
      name: "MaterialName",
    });
  });

  it("should handle errors thrown by CreateMaterialUseCase", async () => {
    vi.spyOn(createMaterialUseCase, "execute").mockImplementation(() => {
      throw new Error("createMaterialUseCase error");
    });

    try {
      await materialController.createMaterial({ name: "MaterialWithError" });
    } catch (error) {
      if (error instanceof HttpException) {
        expect(error.message).toBe("Failed to create material");
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        throw new Error("Expected HttpException");
      }
    }
  });

  it("should edit a material successfully", async () => {
    const mockMaterial = Material.create(
      {
        name: "UpdatedMaterialName",
      },
      new UniqueEntityID("material-1")
    );
    const mockResult = right({ material: mockMaterial }) as Either<
      ResourceNotFoundError,
      { material: Material }
    >;
    vi.spyOn(editMaterialUseCase, "execute").mockResolvedValue(mockResult);

    const result = await materialController.editMaterial("material-1", {
      name: "UpdatedMaterialName",
    });

    expect(result).toEqual(mockResult.value);
    expect(editMaterialUseCase.execute).toHaveBeenCalledWith({
      materialId: "material-1",
      name: "UpdatedMaterialName",
    });
  });

  it("should handle errors thrown by EditMaterialUseCase", async () => {
    vi.spyOn(editMaterialUseCase, "execute").mockImplementation(() => {
      throw new Error("EditMaterialUseCase error");
    });

    try {
      await materialController.editMaterial("material-1", {
        name: "UpdatedBrandWithError",
      });
    } catch (error) {
      if (error instanceof HttpException) {
        expect(error.message).toBe("Failed to update material");
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        throw new Error("Expected HttpException");
      }
    }
  });

  it("should find a material by name successfully", async () => {
    const mockMaterial = Material.create(
      {
        name: "MaterialName",
      },
      new UniqueEntityID("material-1")
    );
    const mockResult = right({ material: mockMaterial }) as Either<
      ResourceNotFoundError,
      { material: Material }
    >;
    vi.spyOn(findMaterialByNameUseCase, "execute").mockResolvedValue(
      mockResult
    );

    const result = await materialController.findMaterialByName("MaterialName");

    expect(result).toEqual(mockResult.value);
    expect(findMaterialByNameUseCase.execute).toHaveBeenCalledWith({
      name: "MaterialName",
    });
  });

  it("should handle errors thrown by findMaterialByNameUseCase", async () => {
    vi.spyOn(findMaterialByNameUseCase, "execute").mockImplementation(() => {
      throw new Error("findMaterialByNameUseCase error");
    });

    try {
      await materialController.findMaterialByName("MAterialWithError");
    } catch (error) {
      if (error instanceof HttpException) {
        expect(error.message).toBe("Failed to find material");
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

  //     const result = await brandController.getAllBrands({
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
  //       await brandController.getAllBrands({ page: 1, pageSize: 10 });
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

  //     const result = await brandController.findBrandById("brand-1");

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
  //       await brandController.findBrandById("MAterialWithError");
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

  //     const result = await brandController.deleteBrand("brand-1");

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
  //       await brandController.deleteBrand("BrandWithError");
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
