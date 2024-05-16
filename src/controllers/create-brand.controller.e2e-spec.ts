import { AppModule } from "@/app.module";
import { PrismaService } from "@/prisma/prisma.service";
import { HttpStatus, INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

describe("Brand Controller (E2E)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let brandId: string;

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

    console.log("Authentication Response:", response.body);
    authToken = response.body.access_token;
    console.log("authTOken", authToken);

    if (!authToken) {
      throw new Error("Authentication failed: No token received");
    }
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
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "marca 2" });

    console.log("Create Brand Response:", response.body);
    const brandResponse = response.body.brand;
    console.log("brandResponse", brandResponse);

    expect(response.statusCode).toBe(HttpStatus.CREATED);
    expect(response.body).toHaveProperty("brand");
    expect(brandResponse).toHaveProperty("props");
    expect(brandResponse.props.name).toEqual("marca 2");

    expect(brandResponse.props).toHaveProperty("createdAt");
    expect(brandResponse.props).toHaveProperty("updatedAt");

    brandId = brandResponse.id;
  });

  test("[POST] /brands with invalid data", async () => {
    const response = await request(app.getHttpServer())
      .post("/brands")
      .set("Authorization", `Bearer ${authToken}`)
      .send({});

    expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body.message).toContain("Validation failed");
  });

  test("[PUT] /brands/:id", async () => {
    const updatedBrandData = { name: "marca 3" };
    const response = await request(app.getHttpServer())
      .put(`/brands/${brandId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send(updatedBrandData);

    expect(response.statusCode).toBe(200);
    console.log("put brand response body", response.body);
    expect(response.body.brand.props.name).toEqual(updatedBrandData.name);
  });

  test("[GET] /brands", async () => {
    const response = await request(app.getHttpServer())
      .get("/brands")
      .query({ name: "marca 1" })
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.statusCode).toBe(HttpStatus.OK);
    expect(response.body).toHaveProperty("brand");
    expect(response.body.brand.props.name).toEqual("marca 1");
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
