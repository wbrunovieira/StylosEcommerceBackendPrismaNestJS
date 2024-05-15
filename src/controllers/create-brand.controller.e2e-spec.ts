import { AppModule } from "@/app.module";
import { PrismaService } from "@/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

describe("Brand Controller (E2E)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let brandId;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    await prisma.brand.deleteMany({});
    const brand = await prisma.brand.create({
      data: { name: "marca 1" },
    });
    brandId = brand.id;
  });
  afterAll(async () => {
    await app.close();
  });

  test("[POST] /brands", async () => {
    const response = await request(app.getHttpServer())
      .post("/brands")
      .send({ name: "marca 2" });

    const brandResponse = response.body.brand.props;

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("brand");
    expect(response.body.brand).toHaveProperty("props");
    expect(brandResponse.name).toEqual("marca 2");
    expect(brandResponse).toHaveProperty("createdAt");
    expect(brandResponse).toHaveProperty("updatedAt");
   

    brandId = response.body.brand._id.value;
  });

  test("[POST] /brands with invalid data", async () => {
    const response = await request(app.getHttpServer())
      .post("/brands")
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toContain("Validation failed");
  });

  // test("[GET] /brands", async () => {
  //   const response = await request(app.getHttpServer())
  //     .get("/brands")
  //     .query({ page: "1", pageSize: "10" });
  //   expect(response.statusCode).toBe(200);
  //   expect(Array.isArray(response.body)).toBeTruthy();
  //   expect(response.body.length).toBeGreaterThan(0);
  // });

  // test("[GET] /brands/:id", async () => {
  //   const response = await request(app.getHttpServer()).get(
  //     `/brands/${brandId}`
  //   );
  //   expect(response.statusCode).toBe(200);
  //   console.log("Response body:", JSON.stringify(response.body, null, 2));
  //   expect(response.body.props.name).toEqual("marca 1");
  // });

  // test("[PUT] /brands/:id", async () => {
  //   const updatedBrandData = { name: "marca 3" };
  //   const response = await request(app.getHttpServer())
  //     .put(`/brands/${brandId}`)
  //     .send(updatedBrandData);

  //   expect(response.statusCode).toBe(200);
  //   console.log("put brand response body", response.body);
  //   expect(response.body.brand.props.name).toEqual(updatedBrandData.name);
  // });

  // test("[DELETE] /brands/:id", async () => {
  //   const response = await request(app.getHttpServer()).delete(
  //     `/brands/${brandId}`
  //   );
  //   expect(response.statusCode).toBe(200);

  //   expect(response.body.message).toEqual("brand deleted successfully");
  //   console.log("delete brand response body", response.body);
  // });

  afterAll(async () => {
    await app.close();
  });
});
