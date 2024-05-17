import { AppModule } from "@/app.module";
import { PrismaService } from "@/prisma/prisma.service";
import { HttpStatus, INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

describe("Materials Controller (E2E)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let materialId: string;

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
    await prisma.material.deleteMany({});
    const material = await prisma.material.create({
      data: { name: "material 1" },
    });
    materialId = material.id;
  });

  test("[POST] /materials", async () => {
    const response = await request(app.getHttpServer())
      .post("/materials")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "material 2" });

    const materialResponse = response.body.material;

    expect(response.statusCode).toBe(HttpStatus.CREATED);
    expect(response.body).toHaveProperty("material");
    expect(materialResponse).toHaveProperty("props");
    expect(materialResponse.props.name).toEqual("material 2");

    expect(materialResponse.props).toHaveProperty("createdAt");
    expect(materialResponse.props).toHaveProperty("updatedAt");

    materialId = response.body.material._id.value;
  });

  test("[GET] /materials", async () => {
    const response = await request(app.getHttpServer())
      .get("/materials")
      .query({ name: "material 1" })
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.statusCode).toBe(HttpStatus.OK);
    console.log("material response", response.body);
    expect(response.body).toHaveProperty("material");
    expect(response.body.material.props.name).toEqual("material 1");
  });

  test("[GET] /materials/:id", async () => {
    const response = await request(app.getHttpServer())
      .get(`/materials/${materialId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(HttpStatus.OK);

    expect(response.body).toHaveProperty("material");
    expect(response.body.material.props.name).toEqual("material 1");
  });

  test("[PUT] /materials/:id", async () => {
    const updatedMaterialData = { name: "marca 3" };
    const response = await request(app.getHttpServer())
      .put(`/materials/${materialId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send(updatedMaterialData);

    expect(response.statusCode).toBe(200);

    expect(response.body.material.props.name).toEqual(updatedMaterialData.name);
  });

  test("[GET] /materials/all", async () => {
    const response = await request(app.getHttpServer())
      .get("/materials/all")
      .query({ page: 1, pageSize: 10 })
      .set("Authorization", `Bearer ${authToken}`)
      .expect(HttpStatus.OK);
    console.log("get all materials response", response.body);
    expect(response.body.materials).toHaveLength(1);
    expect(response.body.materials[0].props.name).toEqual("material 1");
  });

  test("[DELETE] /materials/:id", async () => {
    const response = await request(app.getHttpServer())
      .delete(`/materials/${materialId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(HttpStatus.OK);

    expect(response.body.message).toEqual("Material deleted successfully");
  });

  afterAll(async () => {
    await app.close();
  });
});
