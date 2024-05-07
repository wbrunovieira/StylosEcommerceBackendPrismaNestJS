import { PaginationParams } from '@/core/repositories/pagination-params';
import { Color } from '../../enterprise/entities/color';

export interface ColorRepository {
  findById(id: string): Promise<Color | null>;
  create(product: Color): Promise<void>;
  delete(product: Color): Promise<void>;
  save(product: Color): Promise<void>;
  findAll(params: PaginationParams): Promise<Color[]>;
}
