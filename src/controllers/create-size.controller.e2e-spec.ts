import { AppModule } from "@/app.module";
import { PrismaService } from "@/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

describe("Size Controller (E2E)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let sizeId: string;

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
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "g" });

    const sizeResponse = response.body.size.props;

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("size");
    expect(response.body.size).toHaveProperty("props");
    expect(sizeResponse.name).toEqual("g");
    expect(sizeResponse).toHaveProperty("createdAt");
    expect(sizeResponse).toHaveProperty("updatedAt");

    sizeId = response.body.size._id.value;
  
  });

  afterAll(async () => {
    await app.close();
  });
});
