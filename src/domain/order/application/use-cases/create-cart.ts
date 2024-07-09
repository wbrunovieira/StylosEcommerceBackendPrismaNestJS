import { Either, left, right } from "@/core/either";
import { Injectable } from "@nestjs/common";
import { ICartRepository } from "../repositories/i-cart-repository";

import { Cart } from "../../enterprise/entities/cart";
import { CartItem } from "../../enterprise/entities/cart-item";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { ResourceNotFoundError } from "@/domain/catalog/application/use-cases/errors/resource-not-found-error";
import { IProductRepository } from "@/domain/catalog/application/repositories/i-product-repository";
import { IProductVariantRepository } from "@/domain/catalog/application/repositories/i-product-variant-repository";

interface CreateCartUseCaseRequest {
  userId: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
    colorId?: string;
    sizeId?: string;
  }[];
}

type CreateCartUseCaseResponse = Either<
  ResourceNotFoundError | null,
  {
    cart: Cart;
  }
>;

@Injectable()
export class CreateCartUseCase {
  constructor(
    private cartRepository: ICartRepository,
    private productRepository: IProductRepository,
    private variantRepository: IProductVariantRepository 
  ) {}

  async execute({
    userId,
    items,
  }: CreateCartUseCaseRequest): Promise<CreateCartUseCaseResponse> {
    try {
      
      const cartItemsMap: { [productId: string]: CartItem } = {};

      for (const item of items) {

        if (item.quantity <= 0) {
          return left(
            new ResourceNotFoundError("Quantity must be greater than zero")
          );
        }

        let productResult;
        let variant;


        if (item.colorId && item.sizeId) {
          
          const variantResult = await this.variantRepository.findById(
            item.productId
          );

          console.log('variantResult',variantResult)
          console.log('variantResult.value;',variantResult.value)
       
          
          if (variantResult.isLeft()) {
            console.log('variantResult isLeft',variantResult)
            return left(
              new ResourceNotFoundError(`Variant not found: ${item.productId}`)
            );
          }
          
          variant = variantResult.value;
          console.log('variant quase bom variantResult',variantResult)

          console.log('variant quase bom variant',variant)
        

          if (variant.stock < item.quantity) {
            return left(
              new ResourceNotFoundError(
                `Insufficient stock for variant: ${item.productId}`
              )
            );
          }

          console.log('produto com variant quase pronto:',variant)
          
          const productIdString = String(variant.props.productId.value)
          
          console.log('pid do produto da variant:',productIdString)

          productResult = await this.productRepository.findById(productIdString);

          const { product, variants } = productResult.value;

          console.log('product consulltaaaa', product)
          console.log('product consulltaaaa', variants)

          const { height, width, length, weight } = product.props;
          console.log(' product height height',product,height,width,length,weight)

          if (cartItemsMap[item.productId]) {
            console.log('item 11',item)
            const existingItem = cartItemsMap[productIdString];
            existingItem.setQuantity(existingItem.quantity + item.quantity);
          } else {
            console.log('item. ss',item)
            cartItemsMap[productIdString] = new CartItem({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              height: height,
              width: width,
              length: length,
              weight: weight,
              color: item.colorId,
              size: item.sizeId,
            });
          }
        } else {
          console.log('entrou no produto sem size e color com id ',item.productId)
          productResult = await this.productRepository.findById(item.productId);

          const { product, variants } = productResult.value;

            console.log('productResult product',product)

            if (productResult.isLeft()) {
              console.log('productResult product left 2',productResult)
              return left(
                new ResourceNotFoundError(`Product not found: ${item.productId}`)
              );
            }
            
            
            console.log(' product',product)
            
            if (product.stock < item.quantity) {
              return left(
              new ResourceNotFoundError(
                `Insufficient stock for product: ${item.productId}`
              )
            );
          }

          const { height, width, length, weight } = product.props;
          console.log(' product height height',product,height,width,length,weight)
          
          if (cartItemsMap[item.productId]) {
            const existingItem = cartItemsMap[item.productId];
            existingItem.setQuantity(existingItem.quantity + item.quantity);
          } else {
            cartItemsMap[item.productId] = new CartItem({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              height,
              width,
              length,
              weight,
              color: item.colorId,
              size: item.sizeId,
            });
          }
        }

        console.log('chegou aqui cartItemsMap',cartItemsMap)

      }
      console.log('saiu do for no usecase com cartItemsMap',cartItemsMap)

      const cartItems = Object.values(cartItemsMap);
      console.log("cartItems", cartItems);

      const cart = Cart.create({ userId, items: cartItems });
      console.log("cart in usecase", cart);
      await this.cartRepository.create(cart);

      return right({ cart });
    } catch (error) {
      return left(error as Error);
    }
  }
}
