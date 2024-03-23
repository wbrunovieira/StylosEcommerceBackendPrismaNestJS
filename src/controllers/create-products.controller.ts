import { Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user-decorator';
import { UserPayload } from 'src/auth/jwt.strategy';

@Controller('/products')
@UseGuards(JwtAuthGuard)
export class CreateProductController {
  constructor() {}

  @Post()
  async handle(@CurrentUser() user: UserPayload){
    return 'ok';
  }
}
