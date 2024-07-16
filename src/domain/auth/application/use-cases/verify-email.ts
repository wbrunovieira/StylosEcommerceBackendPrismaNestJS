import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { IAccountRepository } from "../repositories/i-account-repository";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";

interface VerifyEmailUseCaseRequest {
    token: string;
}

type VerifyEmailUseCaseResponse = Either<ResourceNotFoundError, null>;

@Injectable()
export class VerifyEmailUseCase {
    constructor(private accountRepository: IAccountRepository) {}

    async execute({
        token,
    }: VerifyEmailUseCaseRequest): Promise<VerifyEmailUseCaseResponse> {
        const user =
            await this.accountRepository.findByVerificationToken(token);

        if (!user) {
            return left(new ResourceNotFoundError("Invalid or expired token"));
        }

        user.isVerified = true;
        user.verificationToken = null;

        await this.accountRepository.save(user);

        return right(null);
    }
}
