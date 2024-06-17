import { Slug } from "./value-objects/slug";

import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

import dayjs from "dayjs";
import { Entity } from "@/core/entities/entity";

interface Category {
  id: UniqueEntityID;
  name: string;
}

interface Brand {
  id: UniqueEntityID;
  name: string;
}

interface Color {
  id: UniqueEntityID;
  name: string;
  hex: string;
}
interface Size {
  id: UniqueEntityID;
  name: string;
}

export interface ProductProps {
  name: string;
  description: string;
  productSizes?: Size[];
  productColors?: Color[];
  productCategories?: Category[];

  materialId?: UniqueEntityID;
  materialName?: string;

  sizeId?: UniqueEntityID[];
  finalPrice?: number;
  brandId: UniqueEntityID;
  brandName?: string;
  brandUrl?: string;
  discount?: number;
  price: number;
  stock: number;
  sku: string;
  slug: Slug;
  height: number;
  width: number;
  length: number;
  weight: number;
  onSale?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class Product extends Entity<ProductProps> {
  private touch() {
    this.props.updatedAt = new Date();
  }

  get height() {
    return this.props.height;
  }

  set height(height: number) {
    this.props.height = height;
    this.touch();
  }

  set width(width: number) {
    this.props.width = width;
    this.touch();
  }
  set length(length: number) {
    this.props.length = length;
    this.touch();
  }

  set weight(weight: number) {
    this.props.weight = weight;
    this.touch();
  }
  set onSale(onSale: boolean) {
    this.props.onSale = onSale;
    this.touch();
  }
  set isFeatured(isFeatured: boolean) {
    this.props.isFeatured = isFeatured;
    this.touch();
  }
  set isNew(isNew: boolean) {
    this.props.isNew = isNew;
    this.touch();
  }
  set images(images: string[]) {
    this.props.images = images;
    this.touch();
  }

  get sku() {
    return this.props.sku;
  }

  get onSale() {
    return this.props.onSale ?? false;
  }
  get discount() {
    return this.props.discount;
  }
  get isFeatured() {
    return this.props.isFeatured ?? false;
  }
  get images() {
    return this.props.images ?? [];
  }
  get width() {
    return this.props.width;
  }
  get length() {
    return this.props.length;
  }

  get weight() {
    return this.props.weight;
  }
  get name() {
    return this.props.name;
  }

  get finalPrice() {
    return this.props.finalPrice;
  }

  get description() {
    return this.props.description;
  }

  get brandId() {
    return this.props.brandId;
  }

  get materialId(): UniqueEntityID | undefined {
    return this.props.materialId;
  }

  get sizeId(): UniqueEntityID[] | undefined {
    return this.props.sizeId;
  }

  get price() {
    return this.props.price;
  }

  get stock() {
    return this.props.stock;
  }

  get slug() {
    return this.props.slug;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  get isNew(): boolean {
    return dayjs().diff(this.createdAt, "days") <= 30;
  }

  get excerpt() {
    return this.description.substring(0, 120).trimEnd().concat("...");
  }

  set name(name: string) {
    this.props.name = name;
    this.props.slug = Slug.createFromText(name);

    this.touch();
  }

  set description(description: string) {
    this.props.description = description;

    this.touch();
  }

  set brandId(brandId: UniqueEntityID) {
    this.props.brandId = brandId;

    this.touch();
  }
  set materialId(materialId: UniqueEntityID) {
    this.props.materialId = materialId;

    this.touch();
  }

  set sizeId(sizeId: UniqueEntityID[]) {
    this.props.sizeId = sizeId;

    this.touch();
  }

  set sku(sku: string) {
    this.props.sku = sku;
    this.touch();
  }

  set price(price: number) {
    this.props.price = price;

    this.touch();
  }

  set stock(stock: number) {
    this.props.stock = stock;

    this.touch();
  }

  set slug(slug: Slug) {
    this.props.slug = slug;

    this.touch();
  }

  get productSizes(): Size[] | undefined {
    return this.props.productSizes;
  }

  set productSizes(sizes: Size[]) {
    this.props.productSizes = sizes;
    this.touch();
  }

  get productCategories(): Category[] | undefined {
    return this.props.productCategories;
  }

  set productColors(colors: Color[]) {
    this.props.productColors = colors;
    this.touch();
  }
  set productCategories(categories: Category[]) {
    this.props.productCategories = categories;
    this.touch();
  }

  // addSize(sizeId: UniqueEntityID) {
  //   if (!this.props.productSizes) {
  //     this.props.productSizes = [];
  //   }
  //   this.props.productSizes.push(sizeId);
  //   this.touch();
  // }

  // addColor(productColorsId: UniqueEntityID) {
  //   if (!this.props.productColors) {
  //     this.props.productColors = [];
  //   }
  //   this.props.productColors.push(productColorsId);
  //   this.touch();
  // }

  addCategory(category: Category) {
    if (!this.props.productCategories) {
      this.props.productCategories = [];
    }
    this.props.productCategories.push(category);
    this.touch();
  }

  set discount(discount: number | undefined) {
    this.props.discount = discount;
    this.touch();
  }

  setFinalPrice(finalPrice: number) {
    this.props.finalPrice = finalPrice;
    this.touch();
  }

  static create(
    props: Optional<ProductProps, "createdAt" | "slug" | "updatedAt">,
    id?: UniqueEntityID
  ): Product {
    const product = new Product(
      {
        ...props,

        createdAt: new Date(),
        updatedAt: new Date(),
        slug: props.slug ?? Slug.createFromText(props.name),
      },
      id
    );

    return product;
  }
}
