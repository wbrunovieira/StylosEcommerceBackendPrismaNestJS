import { Slug } from './value-objects/slug';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Optional } from '@/core/types/optional';

import dayjs from 'dayjs';
import { Entity } from '@/core/entities/entity';

export interface ProductProps {
  name: string;
  description: string;

  sizeId?: UniqueEntityID[];
  materialId?: UniqueEntityID;
  brandID: UniqueEntityID;
  price: number;
  stock: number;
  slug: Slug;
  createdAt: Date;
  updatedAt: Date;
}

export class Product extends Entity<ProductProps> {
  private touch() {
    this.props.updatedAt = new Date();
  }
  get name() {
    return this.props.name;
  }

  get description() {
    return this.props.description;
  }

  get brandId() {
    return this.props.brandID;
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
    return dayjs().diff(this.createdAt, 'days') <= 30;
  }

  get excerpt() {
    return this.description.substring(0, 120).trimEnd().concat('...');
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
    this.props.brandID = brandId;

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

  static create(
    props: Optional<ProductProps, 'createdAt' | 'slug' | 'updatedAt'>,
    id?: UniqueEntityID
  ): Product {
    const now = new Date();
    const product = new Product(
      {
        ...props,
        createdAt: props.createdAt || now,
        updatedAt: props.updatedAt || now,
        slug: props.slug ?? Slug.createFromText(props.name),
      },
      id
    );
    return product;
  }
}
