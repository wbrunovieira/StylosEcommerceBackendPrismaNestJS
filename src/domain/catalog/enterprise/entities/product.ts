import { Slug } from "./value-objects/slug";

import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

import dayjs from "dayjs";
import { Entity } from "@/core/entities/entity";

export interface ProductProps {
  name: string;
  description: string;
  productSizes?: UniqueEntityID[];
  productColors?: UniqueEntityID[];
  productCategories?: UniqueEntityID[];
  materialId?: UniqueEntityID;
  sizeId?: UniqueEntityID[];
  finalPrice?: number;
  brandId: UniqueEntityID;
  discount?: number;
  price: number;
  stock: number;
  slug: Slug;
  height?: number | null;
  width?: number | null;
  length?: number | null;
  weight?: number | null;
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
  get onSale() {
    return this.props.onSale;
  }
  get discount() {
    return this.props.discount;
  }
  get isFeatured() {
    return this.props.isFeatured;
  }
  get images() {
    return this.props.images;
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

  get productColors(): UniqueEntityID[] | undefined {
    return this.props.productColors;
  }

  set productColors(productColors: UniqueEntityID[]) {
    this.props.productColors = productColors;
    this.touch();
  }

  get productSizes(): UniqueEntityID[] | undefined {
    return this.props.productSizes;
  }

  set productSizes(sizes: UniqueEntityID[]) {
    this.props.productSizes = sizes;
    this.touch();
  }

  get productCategories(): UniqueEntityID[] | undefined {
    return this.props.productCategories;
  }

  set productCategories(categories: UniqueEntityID[]) {
    this.props.productCategories = categories;
    this.touch();
  }

  addSize(sizeId: UniqueEntityID) {
    if (!this.props.productSizes) {
      this.props.productSizes = [];
    }
    this.props.productSizes.push(sizeId);
    this.touch();
  }

  addColor(productColorsId: UniqueEntityID) {
    if (!this.props.productColors) {
      this.props.productColors = [];
    }
    this.props.productColors.push(productColorsId);
    this.touch();
  }

  addCategory(categoryId: UniqueEntityID) {
    if (!this.props.productCategories) {
      this.props.productCategories = [];
    }
    this.props.productCategories.push(categoryId);
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
