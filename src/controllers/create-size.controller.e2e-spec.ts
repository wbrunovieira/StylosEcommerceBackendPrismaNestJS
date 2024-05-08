import { AppModule } from "@/app.module";
import { PrismaService } from "@/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

describe("Size Controller (E2E)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let sizeId;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    await prisma.size.deleteMany({});
    const size = await prisma.size.create({
      data: { name: "m" },
    });
    sizeId = size.id;
    console.log("Setup sizeId:", sizeId);
  });

  test("[POST] /size", async () => {
    const response = await request(app.getHttpServer())
      .post("/size")
      .send({ name: "g" });

    const sizeResponse = response.body.size.props;

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("size");
    expect(response.body.size).toHaveProperty("props");
    expect(sizeResponse.name).toEqual("g");
    expect(sizeResponse).toHaveProperty("createdAt");
    expect(sizeResponse).toHaveProperty("updatedAt");

    sizeId = response.body.size._id.value;
    console.log("sizeId dentro do post", sizeId);
    console.log("post response body", response.body);
  });

  test("[GET] /size", async () => {
    const response = await request(app.getHttpServer())
      .get("/size")
      .query({ page: "1", pageSize: "10" });
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.length).toBeGreaterThan(0);
  });

  test("[GET] /size/:id", async () => {
    const response = await request(app.getHttpServer()).get(`/size/${sizeId}`);
    expect(response.statusCode).toBe(200);
    console.log("Response body:", JSON.stringify(response.body, null, 2));
    expect(response.body.props.name).toEqual("m");
  });

  test("[PUT] /size/:id", async () => {
    const updatedSizeData = { name: "gg" };
    const response = await request(app.getHttpServer())
      .put(`/size/${sizeId}`)
      .send(updatedSizeData);

    expect(response.statusCode).toBe(200);
    console.log("put size response body", response.body);
    expect(response.body.size.props.name).toEqual(updatedSizeData.name);
  });

  test("[DELETE] /size/:id", async () => {
    const response = await request(app.getHttpServer()).delete(
      `/size/${sizeId}`
    );
    expect(response.statusCode).toBe(200);

    expect(response.body.message).toEqual("size deleted successfully");
    console.log("delete size response body", response.body);
  });

  afterAll(async () => {
    await app.close();
  });
});
