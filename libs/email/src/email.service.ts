import { Injectable } from '@nestjs/common';
import { AppConfigService } from '@app/config';
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

  constructor(config: AppConfigService) {
    const user = config.smtpUser;

    this.fromAddress = config.smtpFrom;

    const transportOptions: SMTPTransport.Options = {
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpSecure,
      auth: {
        user,
        pass: config.smtpPass,
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
