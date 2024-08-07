import { PaginationParams } from "@/core/repositories/pagination-params";

import { Either } from "@/core/either";
import { User } from "../../enterprise/entities/user";

export abstract class IAccountRepository {
    abstract findById(id: string): Promise<Either<Error, User>>;
    abstract create(account: User): Promise<Either<Error, void>>;
    abstract findByEmail(email: string): Promise<Either<Error, User>>;
    abstract findAll(params: PaginationParams): Promise<Either<Error, User[]>>;
    abstract delete(account: User): Promise<Either<Error, void>>;
    abstract save(account: User): Promise<Either<Error, void>>;
    abstract findByVerificationToken(token: string): Promise<User | null>;
    abstract updatePassword(
        userId: string,
        password: string
    ): Promise<Either<Error, void>>;
}
