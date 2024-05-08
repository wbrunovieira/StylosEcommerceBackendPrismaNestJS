import { AppModule } from "@/app.module";
import { PrismaService } from "@/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

describe("Category Controller (E2E)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let categoryId;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    await prisma.category.deleteMany({});
    const category = await prisma.category.create({
      data: { name: "category 1" },
    });
    categoryId = category.id;
  });

  test("[POST] /category", async () => {
    const response = await request(app.getHttpServer())
      .post("/category")
      .send({ name: "category 2" });

    const categoryResponse = response.body.category.props;

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("category");
    expect(response.body.category).toHaveProperty("props");
    expect(categoryResponse.name).toEqual("category 2");
    expect(categoryResponse).toHaveProperty("createdAt");
    expect(categoryResponse).toHaveProperty("updatedAt");

    categoryId = response.body.category._id.value;
  });

  test("[GET] /category", async () => {
    const response = await request(app.getHttpServer())
      .get("/category")
      .query({ page: "1", pageSize: "10" });
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.length).toBeGreaterThan(0);
  });

  test("[GET] /category/:id", async () => {
    const response = await request(app.getHttpServer()).get(
      `/category/${categoryId}`
    );
    expect(response.statusCode).toBe(200);
    console.log("Response body:", JSON.stringify(response.body, null, 2));
    expect(response.body.props.name).toEqual("category 1");
  });

  test("[PUT] /category/:id", async () => {
    const updatedCategoryData = { name: "category 3" };
    const response = await request(app.getHttpServer())
      .put(`/category/${categoryId}`)
      .send(updatedCategoryData);

    expect(response.statusCode).toBe(200);
    console.log("put category response body", response.body);
    expect(response.body.category.props.name).toEqual(updatedCategoryData.name);
  });

  test("[DELETE] /category/:id", async () => {
    const response = await request(app.getHttpServer()).delete(
      `/category/${categoryId}`
    );
    expect(response.statusCode).toBe(200);

    expect(response.body.message).toEqual("category deleted successfully");
  });

  afterAll(async () => {
    await app.close();
  });
});
