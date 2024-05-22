import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';

import { CreateAccountController } from './controllers/account.controller';
import { envSchema } from 'src/env';
import { AuthenticateController } from './controllers/authenticate.controller';


import { ListAllProductsController } from './controllers/list-all-products.controller';
import { ListAllAccountsController } from './controllers/list-all-accounts.controller';
import { CatalogModule } from './domain/catalog/catalog.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    AuthModule,
    CatalogModule,
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
