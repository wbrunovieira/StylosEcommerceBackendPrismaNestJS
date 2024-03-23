import { Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('/products')
@UseGuards(JwtAuthGuard)
export class CreateProductController {
  constructor() {}

  @Post()
  async handle() {
    return 'ok';
  }
}
