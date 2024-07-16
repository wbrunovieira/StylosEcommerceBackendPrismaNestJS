import { Injectable, InternalServerErrorException } from "@nestjs/common";
import * as sgMail from "@sendgrid/mail";

@Injectable()
export class MailerService {
    constructor() {
        const apiKey = process.env.SENDGRID_API_KEY;
        if (!apiKey) {
            throw new InternalServerErrorException('SENDGRID_API_KEY não está definido');
        }
        sgMail.setApiKey(apiKey);
    }

    async sendVerificationEmail(email: string, token: string) {
        const verificationUrl = `${process.env.NEXT_PUBLIC_URL}/verify-email?token=${token}`;
        const msg = {
            to: email,
            from: "no-reply@styloslingerie.com.br",
            subject: "Confirmação do email",
            text: `Por favor confirme o seu email, clicando no link: ${verificationUrl}`,
            html: `<b>Por favor confirme o seu email, clicando no link: <a href="${verificationUrl}">${verificationUrl}</a></b>`,
        };
        await sgMail.send(msg);
    }
}
