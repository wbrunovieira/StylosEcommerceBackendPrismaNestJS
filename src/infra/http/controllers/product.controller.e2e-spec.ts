import { AppModule } from "@/app.module";
import { PrismaService } from "@/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";

import { Test } from "@nestjs/testing";
import request from "supertest";

describe("Create products (E2E)", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let authToken: string;

  let brandId: string;
  let materialId: string;
  let categoryId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get(PrismaService);

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
    await prisma.product.deleteMany({});
    await prisma.brand.deleteMany({});
    await prisma.material.deleteMany({});
    await prisma.category.deleteMany({});

    const brand = await prisma.brand.create({
      data: { name: "brand" },
    });
    brandId = brand.id;
    

    const material = await prisma.material.create({
      data: { name: "cotton" },
    });
    materialId = material.id;
   

    const category = await prisma.category.create({
      data: { name: "categoria teste" },
    });

    categoryId = category.id;
    
  });

  test("[POST] /products", async () => {
    const response = await request(app.getHttpServer())
      .post("/products")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "calcinha 1",
        description: "calcinha description 1 mais texto, legal, muiito legal",
        images: ["/images/foto1.jpg"],
        materialId: materialId,
        brandId: brandId,
        price: 100,
        stock: 10,
        productCategories: [categoryId],
      });

    const productResponse = response.body.product.props;

   

    expect(response.statusCode).toBe(201);

    expect(response.body).toHaveProperty("product");
    expect(response.body.product).toHaveProperty("props");
    expect(productResponse.name).toEqual("calcinha 1");
    expect(productResponse).toHaveProperty("createdAt");
    expect(productResponse).toHaveProperty("updatedAt");
  });

  afterAll(async () => {
    await app.close();
  });
});
