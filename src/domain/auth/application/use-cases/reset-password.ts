import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { IAccountRepository } from "../repositories/i-account-repository";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { Either, left, right } from "@/core/either";
import { hash } from "bcryptjs";

interface ResetPasswordUseCaseRequest {
    userId: string;
    token: string;
    newPassword: string;
}

type ResetPasswordUseCaseResponse = Either<ResourceNotFoundError, null>;

@Injectable()
export class ResetPasswordUseCase {
    constructor(private accountRepository: IAccountRepository) {}

    async execute({
        userId,
        newPassword,
        token
    }: ResetPasswordUseCaseRequest): Promise<ResetPasswordUseCaseResponse> {
        const userOrError = await this.accountRepository.findById(userId);

        if (userOrError.isLeft()) {
            return left(new ResourceNotFoundError("User not found"));
        }

        const user = userOrError.value;

        const [tokenValue, timestamp] = token.split('.');
        const tokenTimestamp = parseInt(timestamp, 10);
        const now = Date.now();
        const validPeriod = 60 * 60 * 1000; 

        if (user.verificationToken !== tokenValue || (now - tokenTimestamp) > validPeriod) {
            return left(new ResourceNotFoundError("Invalid or expired token"));
        }

     
        const hashPassword = await hash(newPassword, 8);

        const result = await this.accountRepository.updatePassword(
            userId,
            hashPassword
        );
        if (result.isLeft()) {
            return left(
                new InternalServerErrorException("Failed to update password")
            );
        }

        return right(null);
    }
}
