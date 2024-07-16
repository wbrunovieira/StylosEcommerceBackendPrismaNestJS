import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as sgMail from "@sendgrid/mail";
import { Env } from "src/env";

@Injectable()
export class MailerService {
    constructor(private configService: ConfigService<Env, true>) {
        console.log("entrou no servico email");
        this.configService = configService;
        const apiKey = configService.get("SENDGRID_API_KEY");
        let url = configService.get("NEXT_PUBLIC_URL");

        if (!apiKey) {
            throw new InternalServerErrorException(
                "SENDGRID_API_KEY não está definido"
            );
        }
        sgMail.setApiKey(apiKey);
        console.log("saindo da apikeyno servico email");
    }

    async sendVerificationEmail(email: string, token: string) {
        const verificationUrl = `${this.configService.get("NEXT_PUBLIC_URL")}/verify-email?token=${token}`;
        const msg = {
            to: email,
            from: "wbrunovieira77@gmail.com",
            subject: "Confirmação do email",
            text: `Por favor confirme o seu email, clicando no link: ${verificationUrl}`,
            html: `<b>Por favor confirme o seu email, clicando no link: <a href="${verificationUrl}">${verificationUrl}</a></b>`,
        };
        console.log("enviando email", msg);
        try {
            const sentEmail = await sgMail.send(msg);
            console.log("email enviado", sentEmail);
        } catch (error: any) {
            if (
                error.response &&
                error.response.body &&
                error.response.body.errors
            ) {
                console.error(
                    "erro ao enviar email",
                    error.response.body.errors
                );
            } else {
                console.error(
                    "erro ao enviar email",
                    error.message || error.toString()
                );
            }
            throw new InternalServerErrorException(
                "Falha ao enviar e-mail de verificação"
            );
        }
    }
}
