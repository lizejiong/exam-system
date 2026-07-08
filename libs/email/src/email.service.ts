import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

@Injectable()
export class EmailService {
  private readonly transporter: Transporter<
    SMTPTransport.SentMessageInfo,
    SMTPTransport.Options
  >;

  private readonly fromAddress: string;

  constructor() {
    const port = Number(process.env.SMTP_PORT ?? 587);
    const user = process.env.SMTP_USER ?? '';

    this.fromAddress = process.env.SMTP_FROM ?? user;

    const transportOptions: SMTPTransport.Options = {
      host: process.env.SMTP_HOST ?? 'smtp.qq.com',
      port,
      secure: port === 465,
      auth: {
        user,
        pass: process.env.SMTP_PASS ?? '',
      },
    };

    this.transporter = createTransport(transportOptions);
  }

  async sendMail({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }) {
    await this.transporter.sendMail({
      from: {
        name: '考试系统',
        address: this.fromAddress,
      },
      to,
      subject,
      html,
    });
  }
}
