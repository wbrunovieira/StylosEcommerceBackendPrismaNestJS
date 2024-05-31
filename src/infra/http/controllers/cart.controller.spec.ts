import { describe, it, expect, beforeEach } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { ConflictException, INestApplication } from "@nestjs/common";
import request from "supertest";

import { CreateCartUseCase } from "@/domain/order/application/use-cases/create-cart";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { CartController } from "./cart.controller";

describe("CartController", () => {
  let app: INestApplication;
  let createCartUseCase: CreateCartUseCase;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        {
          provide: CreateCartUseCase,
          useValue: {
            execute: vi.fn(),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    createCartUseCase = moduleFixture.get<CreateCartUseCase>(CreateCartUseCase);
    await app.init();
  });

  it("should create a cart successfully", async () => {
    const mockResponse = { cart: { userId: "user-123", items: [] } };

    const mockResult = right({
      cart: { userId: "user-123", items: [] },
    }) as Either<ConflictException | null, { cart: any }>;

    vi.spyOn(createCartUseCase, "execute").mockResolvedValue(mockResult);

    await request(app.getHttpServer())
      .post("/cart")
      .send({
        userId: "user-123",
        items: [{ productId: "product-1", quantity: 1, price: 100 }],
      })
      .expect(201)
      .expect(mockResponse);
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

    it('should return a conflict error if quantity is invalid', async () => {
      vi.spyOn(createCartUseCase, 'execute').mockResolvedValue(left(new ResourceNotFoundError('Quantity must be greater than zero')));

      await request(app.getHttpServer())
        .post('/cart')
        .send({ userId: 'user-123', items: [{ productId: 'product-1', quantity: 0, price: 100 }] })
        .expect(409)
        .expect({
          statusCode: 409,
          message: 'Quantity must be greater than zero',
          error: 'Conflict',
        });
    });

  afterEach(async () => {
    await app.close();
  });
});
