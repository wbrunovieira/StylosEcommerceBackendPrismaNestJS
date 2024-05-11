import { PaginationParams } from '@/core/repositories/pagination-params';
import { Color } from '../../enterprise/entities/color';

export interface IColorRepository {
  findById(id: string): Promise<Color | null>;
  create(color: Color): Promise<void>;
  delete(color: Color): Promise<void>;
  save(color: Color): Promise<void>;
  findAll(params: PaginationParams): Promise<Color[]>;
}
