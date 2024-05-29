import { AppModule } from "@/app.module";
import { PrismaService } from "@/prisma/prisma.service";

import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

describe("Create Account (E2E)", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ["bruno@example.com", "duplicate@example.com"],
        },
      },
    });

    await app.close();
  });

  test("[POST] /accounts  - Success", async () => {
    const response = await request(app.getHttpServer()).post("/accounts").send({
      name: "Bruno Vieira",
      email: "bruno@example.com",
      password: "12345@aA",
    });

    expect(response.statusCode).toBe(201);

    const userOnDatabase = await prisma.user.findUnique({
      where: {
        email: "bruno@example.com",
      },
    });

    expect(userOnDatabase).toBeTruthy();
  });

  test("[POST] /accounts - Missing Name", async () => {
    const response = await request(app.getHttpServer()).post("/accounts").send({
      email: "missingname@example.com",
      password: "12345@aA",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toContain("Validation failed");
    expect(response.body.errors.details).toContainEqual({
      code: "invalid_type",
      expected: "string",
      message: "Required",
      path: ["name"],
      received: "undefined",
    });
  });

  test("[POST] /accounts - Invalid Email", async () => {
    const response = await request(app.getHttpServer()).post("/accounts").send({
      name: "Invalid Email",
      email: "invalid-email",
      password: "12345@aA",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toContain("Validation failed");
    expect(response.body.errors.details).toContainEqual({
      code: "invalid_string",
      validation: "email",
      message: "Invalid email",
      path: ["email"],
    });
  });

  test("[POST] /accounts - Weak Password", async () => {
    const response = await request(app.getHttpServer()).post("/accounts").send({
      name: "Weak Password",
      email: "weakpassword@example.com",
      password: "weak",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toContain("Validation failed");
    expect(response.body.errors.details).toContainEqual({
      code: "too_small",
      minimum: 6,
      inclusive: true,
      exact: false, 
      message: "Password must be at least 6 characters long",
      path: ["password"],
      type: "string",
    });
    expect(response.body.errors.details).toContainEqual({
      code: "invalid_string",
      message: "Password must contain at least one uppercase letter",
      path: ["password"],
      validation: "regex",
    });
    expect(response.body.errors.details).toContainEqual({
      code: "invalid_string",
      message: "Password must contain at least one number",
      path: ["password"],
      validation: "regex",
    });
    expect(response.body.errors.details).toContainEqual({
      code: "invalid_string",
      message: "Password must contain at least one special character",
      path: ["password"],
      validation: "regex",
    });
  });

  test("[POST] /accounts - Email Conflict", async () => {
    await request(app.getHttpServer()).post("/accounts").send({
      name: "Duplicate User",
      email: "duplicate@example.com",
      password: "12345@aA",
    });

    const response = await request(app.getHttpServer()).post("/accounts").send({
      name: "Duplicate User",
      email: "duplicate@example.com",
      password: "12345@aA",
    });

    expect(response.statusCode).toBe(409);
    expect(response.body.message).toContain("User already exists");
  });
});
