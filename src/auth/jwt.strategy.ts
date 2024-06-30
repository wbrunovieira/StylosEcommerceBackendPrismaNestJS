import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import axios from "axios";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Env } from "src/env";
import { z } from "zod";

const tokenPayloadSchema = z.object({
  sub: z.string().uuid(),
  role: z.string(),
});

export type UserPayload = z.infer<typeof tokenPayloadSchema>;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService<Env, true>) {
    const publicKey = config.get("JWT_PUBLIC_KEY", { infer: true });
    console.log("entrou no jwt strategy");

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: Buffer.from(publicKey, "base64"),
      algorithms: ["RS256"],
    });
  }

  async validate(payload: any) {
    console.log("entrou no jwt strategy validate", payload);
    if (payload.iss !== "https://accounts.google.com") {
      console.log("Token não é do Google", payload);
      return tokenPayloadSchema.parse(payload);
    }

    const tokenInfo = await this.validateGoogleToken(payload);
    console.log("Informações do token do Google", tokenInfo);
    return tokenPayloadSchema.parse(tokenInfo);
  }

  async validateGoogleToken(idToken: any) {
    console.log("Validando token do Google", idToken);
    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${idToken}`
    );

    if (response.data.aud !== process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      throw new UnauthorizedException("Invalid Google token");
    }
    console.log("Resposta da validação do Google", response.data);

    return {
      sub: response.data.sub,
      role: "user",
      ...response.data,
    };
  }
}
