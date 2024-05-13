import { PaginationParams } from '@/core/repositories/pagination-params';
import { Color } from '../../enterprise/entities/color';
import { Either } from '@/core/either';

export interface IColorRepository {
  findById(id: string): Promise<Either<Error, Color>>;
  create(color: Color): Promise<Either<Error, void>>;
  delete(color: Color): Promise<Either<Error, void>>;
  save(color: Color): Promise<Either<Error, void>>;
  findAll(params: PaginationParams): Promise<Either<Error, Color[]>>
}
