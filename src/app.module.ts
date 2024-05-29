import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { PrismaService } from "./prisma/prisma.service";

import { AccountController } from "./infra/http/controllers/account.controller";
import { envSchema } from "src/env";
import { AuthenticateController } from "./infra/http/controllers/authenticate.controller";

import { ListAllProductsController } from "./infra/http/controllers/list-all-products.controller";
import { ListAllAccountsController } from "./infra/http/controllers/list-all-accounts.controller";

import { DatabaseModule } from "./infra/database/database.module";
import { HttpModule } from "./infra/http/http.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    AuthModule,
    HttpModule,
    DatabaseModule,
  ],
  controllers: [
    AuthenticateController,
    ListAllProductsController,
    ListAllAccountsController,
  ],
  providers: [PrismaService],
})
export class AppModule {}
