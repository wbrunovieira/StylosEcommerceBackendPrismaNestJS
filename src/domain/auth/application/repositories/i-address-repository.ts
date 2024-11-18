import { Either } from "@/core/either";
import { Address } from "../../enterprise/entities/address";
import { PaginationParams } from "@/core/repositories/pagination-params";

export abstract class IAddressRepository {
    abstract findById(id: string): Promise<Either<Error, Address>>;
    abstract create(address: Address): Promise<Either<Error, void>>;
    abstract findAll(
        params: PaginationParams
    ): Promise<Either<Error, Address[]>>;
    abstract delete(address: Address): Promise<Either<Error, void>>;
    abstract save(address: Address): Promise<Either<Error, void>>;
    abstract findByUserId(
        userId: string,
        params: PaginationParams
    ): Promise<Either<Error, Address[]>>;
}
