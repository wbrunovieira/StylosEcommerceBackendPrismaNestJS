import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, INestApplication } from '@nestjs/common';
import request from 'supertest';


import { AppModule } from '@/app.module';
import { CreateCartUseCase } from '@/domain/order/application/use-cases/create-cart';
import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/domain/catalog/application/use-cases/errors/resource-not-found-error';
import { CartController } from '@/infra/http/controllers/cart.controller';

describe('CartController', () => {
  let app: INestApplication;
  let createCartUseCase: CreateCartUseCase;
  let authToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
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

    const response = await request(app.getHttpServer())
    .post("/sessions")
    .send({ email: "admin@example.com", password: "adminpassword" });

  authToken = response.body.access_token;


  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a cart successfully', async () => {
    const mockResponse = { cart: { userId: 'user-123', items: [] } };
    const mockResult = right({ cart: mockResponse.cart }) as Either<ConflictException | null, { cart: any }>;

    vi.spyOn(createCartUseCase, 'execute').mockResolvedValue(mockResult);

    const response = await request(app.getHttpServer())
      .post('/cart')
      .send({ userId: 'user-123', items: [{ productId: 'product-1', quantity: 1, price: 100 }] })
      .expect(201);

    expect(response.body.cart).toEqual(mockResponse.cart);
  });

  it('should return a conflict error if product does not exist', async () => {
    vi.spyOn(createCartUseCase, 'execute').mockResolvedValue(left(new ResourceNotFoundError('Product not found')));

    const response = await request(app.getHttpServer())
      .post('/cart')
      .send({ userId: 'user-123', items: [{ productId: 'nonexistent-product', quantity: 1, price: 100 }] })
      .expect(409);

    expect(response.body.message).toBe('Product not found');
  });

  it('should return a conflict error if there is insufficient stock', async () => {
    vi.spyOn(createCartUseCase, 'execute').mockResolvedValue(left(new ResourceNotFoundError('Insufficient stock')));

    const response = await request(app.getHttpServer())
      .post('/cart')
      .send({ userId: 'user-123', items: [{ productId: 'product-1', quantity: 20, price: 100 }] })
      .expect(409);

    expect(response.body.message).toBe('Insufficient stock');
  });

  it('should return a conflict error if quantity is invalid', async () => {
    vi.spyOn(createCartUseCase, 'execute').mockResolvedValue(left(new ResourceNotFoundError('Quantity must be greater than zero')));

    const response = await request(app.getHttpServer())
      .post('/cart')
      .send({ userId: 'user-123', items: [{ productId: 'product-1', quantity: 0, price: 100 }] })
      .expect(409);

    expect(response.body.message).toBe('Quantity must be greater than zero');
  });
});
