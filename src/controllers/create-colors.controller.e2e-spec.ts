import { AppModule } from "@/app.module";
import { PrismaService } from "@/prisma/prisma.service";
import { HttpStatus, INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

describe("Colors Controller (E2E)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let colorId: string;

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
    await prisma.color.deleteMany({});
    const color = await prisma.color.create({
      data: { name: "blue" },
    });
    colorId = color.id;
    console.log("Setup colorId:", colorId);
  });

  test("[POST] /colors", async () => {
    const response = await request(app.getHttpServer())
      .post("/colors")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "red" });

    const colorResponse = response.body.color.props;

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("color");
    expect(response.body.color).toHaveProperty("props");
    expect(colorResponse.name).toEqual("red");
    expect(colorResponse).toHaveProperty("createdAt");
    expect(colorResponse).toHaveProperty("updatedAt");

    colorId = response.body.color._id.value;
    console.log("colorId dentro do post", colorId);
    console.log("post response body", response.body);
  });

  test("[POST] /colors with invalid data", async () => {
    const response = await request(app.getHttpServer())
      .post("/colors")
      .set("Authorization", `Bearer ${authToken}`)
      .send({});

    expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body.message).toContain("Validation failed");
  });

  test("[GET] /colors", async () => {
    const response = await request(app.getHttpServer())
      .get("/colors")
      .query({ page: "1", pageSize: "10" });
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.length).toBeGreaterThan(0);
  });

  test("[GET] /colors/:id", async () => {
    const response = await request(app.getHttpServer()).get(
      `/colors/${colorId}`
    );
    expect(response.statusCode).toBe(200);
    console.log("Response body:", JSON.stringify(response.body, null, 2));
    expect(response.body.props.name).toEqual("blue");
  });

  test("[PUT] /colors/:id", async () => {
    const updatedColorData = { name: "green" };
    const response = await request(app.getHttpServer())
      .put(`/colors/${colorId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send(updatedColorData);

    expect(response.statusCode).toBe(200);

    expect(response.body.color.props.name).toEqual(updatedColorData.name);
  });

  test("[DELETE] /colors/:id", async () => {
    const response = await request(app.getHttpServer()).delete(
      `/colors/${colorId}`
    );
    expect(response.statusCode).toBe(200);

    expect(response.body.message).toEqual("Color deleted successfully");
    console.log("delete colors response body", response.body);
  });

  afterAll(async () => {
    await app.close();
  });
});
