import { PrismaService } from '../../../../prisma/prisma.service';

import { PaginationParams } from '../../../../core/repositories/pagination-params';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Injectable } from '@nestjs/common';
import { BrandRepository } from './brand-repository';
import { Brand } from '../../enterprise/entities/brand';

@Injectable()
export class PrismaBrandRepository implements BrandRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Brand | null> {
    const record = await this.prisma.brand.findUnique({
      where: { id },
    });
    return record ? Brand.create({ name: record.name }, new UniqueEntityID(record.id)) : null;
  }

  async save(brand: Brand): Promise<void> {
    await this.prisma.brand.update({
        where: { id: brand.id.toString() },
        data: {
            name: brand.name,
            updatedAt: new Date(),
        },
    });
}

  async create(brand: Brand): Promise<void> {
    await this.prisma.brand.create({
      data: {
        name: brand.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async delete(brand: Brand): Promise<void> {
    await this.prisma.brand.delete({
      where: { id: brand.id.toString(), },
    });
  }

  async findAll(params: PaginationParams): Promise<Brand[]> {
    console.log('params',params)

  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  console.log('Pagination params:', { skip, take });
    const records = await this.prisma.brand.findMany({
        skip: skip,
        take: take,
        orderBy: { createdAt: 'asc' },
    });
    console.log('skip', skip)
    console.log('take', take)
    console.log('records', records)

    return records.map(record => Brand.create({ name: record.name }, new UniqueEntityID(record.id)));
  }
}