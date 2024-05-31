import { Test, TestingModule } from "@nestjs/testing";
import {
  ConflictException,
  HttpStatus,
  INestApplication,
} from "@nestjs/common";
import request from "supertest";

import { CreateCartUseCase } from "@/domain/order/application/use-cases/create-cart";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { CartController } from "./cart.controller";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { Reflector } from "@nestjs/core";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "@/auth/jwt.strategy";

describe("CartController", () => {
  let app: INestApplication;
  let createCartUseCase: CreateCartUseCase;
  let jwtService: JwtService;
  let consoleErrorSpy: any;

  beforeEach(async () => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ".env.test",
        }),
        PassportModule,
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get<string>("JWT_SECRET"),
            signOptions: { expiresIn: "60s" },
          }),
          inject: [ConfigService],
        }),
      ],
      controllers: [CartController],
      providers: [
        {
          provide: CreateCartUseCase,
          useValue: {
            execute: vi.fn(),
          },
        },
        JwtStrategy,
        JwtService,
        Reflector,
        {
          provide: JwtAuthGuard,
          useValue: {
            canActivate: (context) => {
              const request = context.switchToHttp().getRequest();
              request.user = {
                userId: "user-123",
                role: "user",
              };
              return true;
            },
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    createCartUseCase = moduleFixture.get<CreateCartUseCase>(CreateCartUseCase);
    jwtService = moduleFixture.get<JwtService>(JwtService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it("should create a cart successfully", async () => {
    const mockResponse = { cart: { userId: "user-123", items: [] } };
    const mockResult = right({ cart: mockResponse.cart }) as Either<
      ConflictException | null,
      { cart: any }
    >;

    vi.spyOn(createCartUseCase, "execute").mockResolvedValue(mockResult);

    const response = await request(app.getHttpServer())
      .post("/cart")
      .send({
        userId: "user-123",
        items: [{ productId: "product-1", quantity: 1, price: 100 }],
      })
      .expect(HttpStatus.CREATED);

    expect(response.body.cart).toEqual(mockResponse.cart);
  });

  it("should return a conflict error if product does not exist", async () => {
    vi.spyOn(createCartUseCase, "execute").mockResolvedValue(
      left(new ResourceNotFoundError("Product not found"))
    );

    await request(app.getHttpServer())
      .post("/cart")
      .send({
        userId: "user-123",
        items: [{ productId: "nonexistent-product", quantity: 1, price: 100 }],
      })
      .expect(409)
      .expect({
        statusCode: 409,
        message: "Product not found",
        error: "Conflict",
      });
  });

  it("should return a conflict error if there is insufficient stock", async () => {
    vi.spyOn(createCartUseCase, "execute").mockResolvedValue(
      left(new ResourceNotFoundError("Insufficient stock"))
    );

    await request(app.getHttpServer())
      .post("/cart")
      .send({
        userId: "user-123",
        items: [{ productId: "product-1", quantity: 20, price: 100 }],
      })
      .expect(409)
      .expect({
        statusCode: 409,
        message: "Insufficient stock",
        error: "Conflict",
      });
  });

  it("should return a conflict error if quantity is invalid", async () => {
    vi.spyOn(createCartUseCase, "execute").mockResolvedValue(
      left(new ResourceNotFoundError("Quantity must be greater than zero"))
    );

    await request(app.getHttpServer())
      .post("/cart")
      .send({
        userId: "user-123",
        items: [{ productId: "product-1", quantity: 0, price: 100 }],
      })
      .expect(409)
      .expect({
        statusCode: 409,
        message: "Quantity must be greater than zero",
        error: "Conflict",
      });
  });
});
