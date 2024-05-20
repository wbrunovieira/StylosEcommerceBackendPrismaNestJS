import { Either, left, right } from "@/core/either";
import { PaginationParams } from "@/core/repositories/pagination-params";
import { IMaterialRepository } from "@/domain/catalog/application/repositories/i-material-repository";

import { Material } from "@/domain/catalog/enterprise/entities/material";

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export class InMemoryMaterialRepository implements IMaterialRepository {
  public items: Material[] = [];

  async create(material: Material): Promise<Either<Error, void>> {
    const existing = this.items.find(
      (b) => b.id.toString() === material.id.toString()
    );
    if (existing) {
      return left(new Error("material already exists"));
    }
    this.items.push(material);
    return right(undefined);
  }

  async findAll(params: PaginationParams): Promise<Either<Error, Material[]>> {
    const { page, pageSize } = params;
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = this.items.slice(startIndex, startIndex + pageSize);
    return right(paginatedItems);
  }


  async findByName(name: string): Promise<Either<Error, Material>> {
    const normalizedName = normalizeName(name);
    const material = this.items.find(
      (item) => normalizeName(item.name) === normalizedName
    );
    if (!material) {
      return left(new Error("material not found"));
    }
    return right(material);
  }
  async save(material: Material): Promise<Either<Error, void>> {
    const index = this.items.findIndex(
      (b) => b.id.toString() === material.id.toString()
    );
    if (index === -1) {
      return left(new Error("material not found"));
    }
    this.items[index] = material;
    return right(undefined);
  }

  async findById(id: string): Promise<Either<Error, Material>> {
    console.log("entrou no findby id do inmmemoryrepo material", id);
    const material = this.items.find((item) => item.id.toString() === id);
    console.log("material no repo inmmemoryrepo ", material);
    if (!material) {
      return left(new Error("Material not found"));
    }
    return right(material);
  }

  async delete(material: Material): Promise<Either<Error, void>> {
    const index = this.items.findIndex(
      (b) => b.id.toString() === material.id.toString()
    );
    if (index === -1) {
      return left(new Error("material not found"));
    }
    this.items.splice(index, 1);
    return right(undefined);
  }

  public addItems(...materials: Material[]): void {
    this.items.push(...materials);
  }
}
