import { AppModule } from "@/app.module";
import { PrismaService } from "@/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import request from "supertest";

describe("Create products (E2E)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwt: JwtService;
  let authToken: string;
  let colorId: string;
  let sizeId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get(PrismaService);
    jwt = moduleRef.get(JwtService);

    await app.init();

    const response = await request(app.getHttpServer())
      .post("/sessions")
      .send({ email: "admin@example.com", password: "adminpassword" });

    authToken = response.body.access_token;

    if (!authToken) {
      throw new Error("Authentication failed: No token received");
    }
  });

  beforeEach(async () => {
    await prisma.color.deleteMany({});
    const color = await prisma.color.create({
      data: { name: "blue" },
    });
    colorId = color.id;

    await prisma.size.deleteMany({});
    const size = await prisma.size.create({
      data: { name: "m" },
    });
    sizeId = size.id;
  });

  test("[POST] /products", async () => {
    const response = await request(app.getHttpServer())
      .post("/products")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "calcinha 1",
        description: "calcinha 1 description",
        color: "blue",
        size: "M",
        material: "cotton",
        brand: "brand 1",
        price: "100.00",
        stock: "10",
      });

    expect(response.statusCode).toBe(201);

    const questionOnDatabase = await prisma.product.findFirst({
      where: {
        name: "calcinha 1",
      },
    });

    expect(questionOnDatabase).toBeTruthy();
  });
});
