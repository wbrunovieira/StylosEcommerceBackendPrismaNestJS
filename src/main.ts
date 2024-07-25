import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { Env } from "./env";

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { cors: true });

    const configService = app.get<ConfigService<Env, true>>(ConfigService);
    const port = configService.get("PORT", { infer: true });

    app.enableCors({
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        preflightContinue: false,
        optionsSuccessStatus: 204,
    });

    app.use((req, res, next) => {
        console.log(`Request received: ${req.method} ${req.url}`);
        res.on("finish", () => {
            console.log(`Response sent: ${res.statusCode}`);
        });
        next();
    });

    await app.listen(port);
}
bootstrap();
