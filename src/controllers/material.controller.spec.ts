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

import { MaterialController } from "./material.controller";
import { CreateMaterialUseCase } from "@/domain/catalog/application/use-cases/create-material";
import { Material } from "@/domain/catalog/enterprise/entities/material";
import { EditMaterialUseCase } from "@/domain/catalog/application/use-cases/edit-material";
import { FindMaterialByNameUseCase } from "@/domain/catalog/application/use-cases/find-material-by-name";
import { FindMaterialByIdUseCase } from "@/domain/catalog/application/use-cases/find-material-by-id";
import { GetAllMaterialsUseCase } from "@/domain/catalog/application/use-cases/get-all-materials";
import { DeleteMaterialUseCase } from "@/domain/catalog/application/use-cases/delete-material";

describe("MaterialController", () => {
  let materialController: MaterialController;
  let createMaterialUseCase: CreateMaterialUseCase;
  let editMaterialUseCase: EditMaterialUseCase;
  let findMaterialByNameUseCase: FindMaterialByNameUseCase;
  let getAllMaterialsUseCase: GetAllMaterialsUseCase;

  let findMaterialByIdUseCase: FindMaterialByIdUseCase;
  let deleteMaterialUseCase: DeleteMaterialUseCase;
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
        {
          provide: GetAllMaterialsUseCase,
          useValue: {
            execute: vi.fn(),
          },
        },
        {
          provide: FindMaterialByIdUseCase,
          useValue: {
            execute: vi.fn(),
          },
        },
        {
          provide: DeleteMaterialUseCase,
          useValue: {
            execute: vi.fn(),
          },
        },
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
    getAllMaterialsUseCase = module.get<GetAllMaterialsUseCase>(
      GetAllMaterialsUseCase
    );
    findMaterialByIdUseCase = module.get<FindMaterialByIdUseCase>(
      FindMaterialByIdUseCase
    );
    deleteMaterialUseCase = module.get<DeleteMaterialUseCase>(
      DeleteMaterialUseCase
    );
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
        name: "UpdatedMaterialWithError",
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

  it("should get all materials successfully", async () => {
    const mockMaterial1 = Material.create(
      {
        name: "Material1",
      },
      new UniqueEntityID("material-1")
    );

    const mockMaterial2 = Material.create(
      {
        name: "Material2",
      },
      new UniqueEntityID("material-2")
    );

    const mockResult = right([mockMaterial1, mockMaterial2]) as Either<
      ResourceNotFoundError,
      Material[]
    >;

    vi.spyOn(getAllMaterialsUseCase, "execute").mockResolvedValue(mockResult);

    const result = await materialController.getAllMaterials({
      page: 1,
      pageSize: 10,
    });

    expect(result).toEqual({ materials: mockResult.value });
    expect(getAllMaterialsUseCase.execute).toHaveBeenCalledWith({
      page: 1,
      pageSize: 10,
    });
  });

  it("should handle errors thrown by GetAllMaterialsUseCase", async () => {
    vi.spyOn(getAllMaterialsUseCase, "execute").mockImplementation(() => {
      throw new Error("GetAllMaterialsUseCase error");
    });

    try {
      await materialController.getAllMaterials({ page: 1, pageSize: 10 });
    } catch (error) {
      if (error instanceof HttpException) {
        expect(error.message).toBe("Failed to retrieve Materials");
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        throw new Error("Expected HttpException");
      }
    }
  });

  it("should find a material by id successfully", async () => {
    const mockMaterial = Material.create(
      {
        name: "materialName",
      },
      new UniqueEntityID("material-1")
    );
    const mockResult = right({ material: mockMaterial }) as Either<
      ResourceNotFoundError,
      { material: Material }
    >;
    vi.spyOn(findMaterialByIdUseCase, "execute").mockResolvedValue(mockResult);

    const result = await materialController.findMaterialById("material-1");

    expect(result).toEqual(mockResult.value);
    expect(findMaterialByIdUseCase.execute).toHaveBeenCalledWith({
      id: "material-1",
    });
  });

  it("should handle errors thrown by FindMaterialByIdUseCase", async () => {
    vi.spyOn(findMaterialByIdUseCase, "execute").mockImplementation(() => {
      throw new Error("FindMaterialByIdUseCase error");
    });

    try {
      await materialController.findMaterialById("MAterialWithError");
    } catch (error) {
      if (error instanceof HttpException) {
        expect(error.message).toBe("Failed to find material");
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        throw new Error("Expected HttpException");
      }
    }
  });

  it("should delete a material successfully", async () => {
    const mockResult = right({}) as Either<ResourceNotFoundError, {}>;
    vi.spyOn(deleteMaterialUseCase, "execute").mockResolvedValue(mockResult);

    const result = await materialController.deleteMaterial("material-1");

    expect(result).toEqual({ message: "Material deleted successfully" });
    expect(deleteMaterialUseCase.execute).toHaveBeenCalledWith({
      materialId: "material-1",
    });
  });

  it("should handle errors thrown by DeleteMaterialUseCase", async () => {
    vi.spyOn(deleteMaterialUseCase, "execute").mockImplementation(() => {
      throw new Error("DeleteMaterialUseCase error");
    });

    try {
      await materialController.deleteMaterial("MaterialWithError");
    } catch (error) {
      if (error instanceof HttpException) {
        expect(error.message).toBe("Failed to delete material");
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        throw new Error("Expected HttpException");
      }
    }
  });
});
