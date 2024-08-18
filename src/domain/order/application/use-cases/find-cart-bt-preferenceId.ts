import { PrismaCartRepository } from "@/infra/database/prisma/repositories/prisma-cart-repository";
import { Injectable } from "@nestjs/common";
import { ICartRepository } from "../repositories/i-cart-repository";

@Injectable()
export class FindCartByPreferenceIdUseCase {
    constructor(private readonly cartRepository: ICartRepository) {}
    async execute(merchant_order_id) {
        let cart = await this.cartRepository.findByMerchantId(merchant_order_id);

        return cart;
    }

    async savePreferenceId(cartId, preferenceId) {
        return await this.cartRepository.savePreferenceId(
            cartId,
            preferenceId,
            "pending"
        );
    }
    async saveCollectionId(cartId, collection_id, merchant_order_id) {
        return await this.cartRepository.saveCollectionId(
            cartId,
            collection_id,
            merchant_order_id
        );
    }
}
