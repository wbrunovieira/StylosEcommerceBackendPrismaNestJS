import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';

import { CreateAccountController } from './controllers/create-account.controller';
import { envSchema } from 'src/env';
import { AuthenticateController } from './controllers/authenticate.controller';
// import { CreateProductController } from './controllers/create-products.controller';
import { ListAllProductsController } from './controllers/list-allproducts.controller';
import { ListAllAccountsController } from './controllers/list-all-accounts.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    AuthModule,
  ],
  controllers: [
    CreateAccountController,
    AuthenticateController,
    
    ListAllProductsController,
    ListAllAccountsController,
  ],
  providers: [PrismaService],
})
export class AppModule {}
