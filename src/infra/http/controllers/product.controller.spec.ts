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

import { CreateProductUseCase } from "@/domain/catalog/application/use-cases/create-product";
import { ProductController } from "./product.controller";
import { Product } from "@/domain/catalog/enterprise/entities/product";
import { PrismaService } from "@/prisma/prisma.service";

describe("ProductController", () => {
  let productController: ProductController;
  let createProductUseCase: CreateProductUseCase;
  let prismaService: PrismaService;

  let consoleErrorSpy: any;

  beforeEach(async () => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        PrismaService,
        {
          provide: CreateProductUseCase,
          useValue: {
            execute: vi.fn(),
          },
        },

        // {
        //   provide: EditProductUseCase,
        //   useValue: {
        //     execute: vi.fn(),
        //   },
        // },
        // {
        //   provide: FindProductByIdUseCase,
        //   useValue: {
        //     execute: vi.fn(),
        //   },
        // },
        // {
        //   provide: GetAllProductsUseCase,
        //   useValue: {
        //     execute: vi.fn(),
        //   },
        // },
        // {
        //   provide: DeleteProductUseCase,
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

    productController = module.get<ProductController>(ProductController);
    createProductUseCase =
      module.get<CreateProductUseCase>(CreateProductUseCase);
    prismaService = module.get<PrismaService>(PrismaService);
    // editProductUseCase = module.get<EditProductUseCase>(EditProductUseCase);
    // findProductByIdUseCase = module.get<FindProductByIdUseCase>(
    //   FindProductByIdUseCase
    // );
    // getAllProductsUseCase = module.get<GetAllProductsUseCase>(
    //   GetAllProductsUseCase
    // );
    // deleteProductUseCase =
    //   module.get<DeleteProductUseCase>(DeleteProductUseCase);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("should create a product successfully", async () => {
    const mockProduct = Product.create(
      {
        name: "ProductName",
        description: "ProductDescription",
        brandId: new UniqueEntityID(),
        price: 100,
        stock: 10,
        images: [],
        onSale: false,
        discount: 0,
        isFeatured: false,
        isNew: false,
      },
      new UniqueEntityID()
    );
    const mockResult = right({ product: mockProduct }) as Either<
      ResourceNotFoundError,
      { product: Product }
    >;
    vi.spyOn(createProductUseCase, "execute").mockResolvedValue(mockResult);

    const result = await productController.createProduct({
      name: "ProductName",
      description: "ProductDescription",
      productCategories: ["category1", "category2"],
      materialId: "material-id",
      brandId: "brand-id",
      price: 100,
      stock: 10,
      images: [],
      onSale: false,
      discount: 0,
      isFeatured: false,
      isNew: false,
      productColors: ["color1", "color2"],
      productSizes: ["size1", "size2"],
    });

    const { product } = mockResult.value;
    const expectedProduct = {
      name: product.props.name,
      description: product.props.description,
      brandId: product.props.brandId,
      price: product.props.price,
      stock: product.props.stock,
      images: product.props.images,
      onSale: product.props.onSale,
      discount: product.props.discount,
      isFeatured: product.props.isFeatured,
      isNew: product.props.isNew,
    };

    const receivedProduct = {
      name: result.product.props.name,
      description: result.product.props.description,
      brandId: result.product.props.brandId,
      price: result.product.props.price,
      stock: result.product.props.stock,
      images: result.product.props.images,
      onSale: result.product.props.onSale,
      discount: result.product.props.discount,
      isFeatured: result.product.props.isFeatured,
      isNew: result.product.props.isNew,
    };

    expect(receivedProduct).toEqual(expectedProduct);
    expect(createProductUseCase.execute).toHaveBeenCalledWith({
      name: "ProductName",
      description: "ProductDescription",
      brandId: "brand-id",
      price: 100,
      stock: 10,
      images: [],
      onSale: false,
      discount: 0,
      isFeatured: false,
      isNew: false,
      productCategories: ["category1", "category2"],
      materialId: "material-id",
      productColors: ["color1", "color2"],
      productSizes: ["size1", "size2"],
      height: null,
      width: null,
      length: null,
      weight: null,
    });
  });

  it("should handle errors thrown by CreateProductUseCase", async () => {
    vi.spyOn(createProductUseCase, "execute").mockImplementation(() => {
      throw new Error("CreateProductUseCase error");
    });

    try {
      await productController.createProduct({
        name: "ProductWithError",
        description: "DescriptionWithError",
        productCategories: ["category1", "category2"],
        materialId: "material-id",
        brandId: "brand-id",
        price: 100,
        stock: 10,
        images: [],
        onSale: false,
        discount: 0,
        isFeatured: false,
        isNew: false,
        productColors: ["color1", "color2"],
        productSizes: ["size1", "size2"],
      });
    } catch (error) {
      if (error instanceof HttpException) {
        expect(error.message).toBe("Failed to create product");
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        throw new Error("Expected HttpException");
      }
    }
  });

  //   it("should find a product by id successfully", async () => {
  //     const mockProduct = Product.create(
  //       {
  //         name: "ProductName",
  //         description: "ProductDescription",
  //         brandId: new UniqueEntityID("brand-1"),
  //         price: 100,
  //         stock: 10,
  //         images: [],
  //         onSale: false,
  //         discount: 0,
  //         isFeatured: false,
  //         isNew: false,
  //       },
  //       new UniqueEntityID("product-1")
  //     );
  //     const mockResult = right({ product: mockProduct }) as Either<
  //       ResourceNotFoundError,
  //       { product: Product }
  //     >;
  //     vi.spyOn(findProductByIdUseCase, "execute").mockResolvedValue(mockResult);

  //     const result = await productController.findProductById("product-1");

  //     expect(result).toEqual(mockResult.value);
  //     expect(findProductByIdUseCase.execute).toHaveBeenCalledWith({
  //       id: "product-1",
  //     });
  //   });

  //   it("should handle errors thrown by FindProductByIdUseCase", async () => {
  //     vi.spyOn(findProductByIdUseCase, "execute").mockImplementation(() => {
  //       throw new Error("FindProductByIdUseCase error");
  //     });

  //     try {
  //       await productController.findProductById("ProductWithError");
  //     } catch (error) {
  //       if (error instanceof HttpException) {
  //         expect(error.message).toBe("Failed to find product");
  //         expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
  //       } else {
  //         throw new Error("Expected HttpException");
  //       }
  //     }
  //   });

  //   it("should get all products successfully", async () => {
  //     const mockProduct1 = Product.create(
  //       {
  //         name: "Product1",
  //         description: "Description1",
  //         brandId: new UniqueEntityID("brand-1"),
  //         price: 100,
  //         stock: 10,
  //         images: [],
  //         onSale: false,
  //         discount: 0,
  //         isFeatured: false,
  //         isNew: false,
  //       },
  //       new UniqueEntityID("product-1")
  //     );

  //     const mockProduct2 = Product.create(
  //       {
  //         name: "Product2",
  //         description: "Description2",
  //         brandId: new UniqueEntityID("brand-2"),
  //         price: 200,
  //         stock: 20,
  //         images: [],
  //         onSale: false,
  //         discount: 0,
  //         isFeatured: false,
  //         isNew: false,
  //       },
  //       new UniqueEntityID("product-2")
  //     );

  //     const mockResult = right([mockProduct1, mockProduct2]) as Either<
  //       ResourceNotFoundError,
  //       Product[]
  //     >;

  //     vi.spyOn(getAllProductsUseCase, "execute").mockResolvedValue(mockResult);

  //     const result = await productController.getAllProducts({
  //       page: 1,
  //       pageSize: 10,
  //     });

  //     expect(result).toEqual({ products: mockResult.value });
  //     expect(getAllProductsUseCase.execute).toHaveBeenCalledWith({
  //       page: 1,
  //       pageSize: 10,
  //     });
  //   });

  //   it("should handle errors thrown by GetAllProductsUseCase", async () => {
  //     vi.spyOn(getAllProductsUseCase, "execute").mockImplementation(() => {
  //       throw new Error("GetAllProductsUseCase error");
  //     });

  //     try {
  //       await productController.getAllProducts({ page: 1, pageSize: 10 });
  //     } catch (error) {
  //       if (error instanceof HttpException) {
  //         expect(error.message).toBe("Failed to retrieve products");
  //         expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
  //       } else {
  //         throw new Error("Expected HttpException");
  //       }
  //     }
  //   });

  //   it("should delete a product successfully", async () => {
  //     const mockResult = right({}) as Either<ResourceNotFoundError, {}>;
  //     vi.spyOn(deleteProductUseCase, "execute").mockResolvedValue(mockResult);

  //     const result = await productController.deleteProduct("product-1");

  //     expect(result).toEqual({ message: "Product deleted successfully" });
  //     expect(deleteProductUseCase.execute).toHaveBeenCalledWith({
  //       productId: "product-1",
  //     });
  //   });

  //   it("should handle errors thrown by DeleteProductUseCase", async () => {
  //     vi.spyOn(deleteProductUseCase, "execute").mockImplementation(() => {
  //       throw new Error("DeleteProductUseCase error");
  //     });

  //     try {
  //       await productController.deleteProduct("ProductWithError");
  //     } catch (error) {
  //       if (error instanceof HttpException) {
  //         expect(error.message).toBe("Failed to delete product");
  //         expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
  //       } else {
  //         throw new Error("Expected HttpException");
  //       }
  //     }
  //   });
});
