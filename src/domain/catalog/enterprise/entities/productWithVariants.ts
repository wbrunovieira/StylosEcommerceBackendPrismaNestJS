
import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Product } from "./product";
import { ProductVariant } from "./product-variant";


interface ProductWithVariantsProps {
  product: Product;
  variants: ProductVariant[];
}

export class ProductWithVariants extends Entity<ProductWithVariantsProps> {
  get product(): Product {
    return this.props.product;
  }

  get variants(): ProductVariant[] {
    return this.props.variants;
  }

  static create(
    props: ProductWithVariantsProps,
    id?: UniqueEntityID
  ) {
    return new ProductWithVariants(props, id);
  }
}
