import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { IOrderRepository } from "../repositories/i-order-repository";
import { Order } from "../../enterprise/entities/order";
import { OrderStatus } from "../../enterprise/entities/order-status";
import { Customer } from "@/domain/costumer/enterprise/entities/customer";
import { ICustomerRepository } from "@/domain/costumer/apllication/repositories/i-customer-repositor";
import { OrderItem } from "../../enterprise/entities/order-item";

interface CreateOrderWithCustomerRequest {
    userId: string;
    cartId: string; // Incluímos o cartId no request
    items: Array<{ productId: string; productName: string; imageUrl: string; quantity: number; price: number }>;
    paymentId: string;
    paymentStatus: string;
    paymentMethod: string;
    paymentDate: Date;
}

@Injectable()
export class CreateOrderUseCase {
    constructor(
        private customerRepository: ICustomerRepository,
        private orderRepository: IOrderRepository
    ) {}

    async execute(
        request: CreateOrderWithCustomerRequest
    ): Promise<Either<Error, void>> {
        // Verificar se o cliente já existe
        const existingCustomerResult = await this.customerRepository.findByUserId(request.userId);

        let customerId: string | null = null;

        if (existingCustomerResult.isRight() && existingCustomerResult.value) {
            // O cliente já existe, então armazenamos o customerId
            customerId = existingCustomerResult.value.id.toString();
        } else {
            // Se o cliente não existir, criamos um novo cliente
            const newCustomer = Customer.create({
                userId: new UniqueEntityID(request.userId),
                firstOrderDate: request.paymentDate,
                customerSince: new Date(),
            });

            const customerCreationResult = await this.customerRepository.create(newCustomer);

            if (customerCreationResult.isLeft()) {
                return left(new Error("Failed to create customer"));
            }

            // Após a criação, armazenamos o customerId
            customerId = newCustomer.id.toString();
        }

        // Criar os itens do pedido a partir dos itens do carrinho
        const orderItems = request.items.map((item) =>
            OrderItem.create({
                orderId: new UniqueEntityID().toString(), // Gera um novo UniqueEntityID para o OrderItem
                productId: new UniqueEntityID(item.productId).toString(),  // Gera um UniqueEntityID para o produto
                productName: item.productName,  // Nome do produto
                imageUrl: item.imageUrl,        // URL da imagem do produto
                quantity: item.quantity,        // Quantidade
                price: item.price,              // Preço
            })
        );
        

        // Criar o pedido (Order) com os dados fornecidos
        const order = Order.create({
            userId: request.userId,           // O userId é obrigatório
            customerId: customerId,           // O customerId (se existir) é armazenado no pedido
            items: orderItems,                // Itens do pedido, mapeados a partir do carrinho
            status: OrderStatus.COMPLETED,    // Status da ordem
            paymentId: request.paymentId,     // ID do pagamento
            paymentStatus: request.paymentStatus, // Status do pagamento
            paymentMethod: request.paymentMethod, // Método de pagamento
            paymentDate: request.paymentDate,     // Data do pagamento
            cartId: request.cartId,           // Armazenamos o cartId para rastreabilidade
        });

        // Salvar o pedido no repositório
        const orderCreationResult = await this.orderRepository.create(order);

        if (orderCreationResult.isLeft()) {
            return left(new Error("Failed to create order"));
        }

        return right(undefined);
    }
}
