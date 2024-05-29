import { Test, TestingModule } from "@nestjs/testing";
import { AccountController } from "./account.controller";
import { CreateAccountUseCase } from "@/domain/auth/application/use-cases/create-account";
import { Either, left, right } from "@/core/either";
import { ConflictException, HttpException, HttpStatus } from "@nestjs/common";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { Reflector } from "@nestjs/core";
import { ExecutionContext } from "@nestjs/common";
import { vi } from "vitest";

describe("AccountController", () => {
  let accountController: AccountController;
  let createAccountUseCase: CreateAccountUseCase;
  let consoleErrorSpy: any;

  beforeEach(async () => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        {
          provide: CreateAccountUseCase,
          useValue: {
            execute: vi.fn(),
          },
        },
        Reflector,
        {
          provide: JwtAuthGuard,
          useValue: {
            canActivate: (context: ExecutionContext) => {
              const request = context.switchToHttp().getRequest();
              request.user = { role: "admin" };
              return true;
            },
          },
        },
      ],
    }).compile();

    accountController = module.get<AccountController>(AccountController);
    createAccountUseCase =
      module.get<CreateAccountUseCase>(CreateAccountUseCase);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("should create an account successfully", async () => {
    const mockUser = {
      id: "user-1",
      name: "UserName",
      email: "user@example.com",
      role: "user",
    };
    const mockResult = right({ user: mockUser }) as Either<
      ConflictException | null,
      { user: any }
    >;
    vi.spyOn(createAccountUseCase, "execute").mockResolvedValue(mockResult);

    const result = await accountController.handle({
      name: "UserName",
      email: "user@example.com",
      password: "P@ssw0rd",
      role: "user",
    });

    expect(result).toEqual(mockResult.value);
    expect(createAccountUseCase.execute).toHaveBeenCalledWith({
      name: "UserName",
      email: "user@example.com",
      password: "P@ssw0rd",
      role: "user",
    });
  });

  it("should handle errors thrown by CreateAccountUseCase", async () => {
    const error = new ConflictException("CreateAccountUseCase error");
    vi.spyOn(createAccountUseCase, "execute").mockResolvedValue(left(error));

    try {
      await accountController.handle({
        name: "UserWithError",
        email: "error@example.com",
        password: "P@ssw0rd",
        role: "user",
      });
    } catch (err) {
      if (err instanceof HttpException) {
        expect(err.message).toBe("CreateAccountUseCase error");
        expect(err.getStatus()).toBe(HttpStatus.CONFLICT);
      } else {
        throw new Error("Expected HttpException");
      }
    }
  });
});
