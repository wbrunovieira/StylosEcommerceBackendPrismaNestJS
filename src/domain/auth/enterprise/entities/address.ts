import { Entity } from "@/core/entities/entity";
import { Optional } from "@/core/types/optional";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

interface AddressProps {
  userId: string;
  street: string;
  number: number;
  complement?: string | undefined ;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Address extends Entity<AddressProps> {
    
  get userId(): string {
    return this.props.userId;
  }
  get street(): string {
    return this.props.street;
  }
  get number(): number {
    return this.props.number;
  }

  get complement(): string  | undefined{
    return this.props.complement ?? "";
  }
  get city(): string {
    return this.props.city;
  }
  get country(): string {
    return this.props.city;
  }

  get state(): string {
    return this.props.state;
  }
  get zipCode(): string {
    return this.props.zipCode;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public static create(
    props: Optional<AddressProps, "createdAt" | "updatedAt" | "complement">,
    id?: UniqueEntityID
  ) {
    const address = new Address(
      {
        ...props,
        complement: props.complement ?? "",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      id
    );
    return address;
  }
}
