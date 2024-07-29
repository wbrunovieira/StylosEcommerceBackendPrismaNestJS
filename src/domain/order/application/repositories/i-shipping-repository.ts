import { Either } from "@/core/either";

import { Shipping } from "../../enterprise/entities/shipping";

export abstract class IShippingRepository {
    abstract create(shipping: Shipping): Promise<Either<Error, void>>;
}
