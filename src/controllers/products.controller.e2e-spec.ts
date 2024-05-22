import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';

describe('Create products (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get(PrismaService);
    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  test('[POST] /questions', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'Bruno Vieira',
        email: 'bruno@example.com',
        password: '123456',
      },
    });

    const accessToken = jwt.sign({ sub: user.id });

    const response = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'calcinha 1',
        description: 'calcinha 1 description',
        color: 'blue',
        size: 'M',
        material: 'cotton',
        brand: 'brand 1',
        price: '100.00',
        stock: '10',
      });

    expect(response.statusCode).toBe(201);

    const questionOnDatabase = await prisma.product.findFirst({
      where: {
        name: 'calcinha 1',
      },
    });

    expect(questionOnDatabase).toBeTruthy();
  });
});
