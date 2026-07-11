import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  get databaseUrl(): string {
    return this.getRequiredString('DATABASE_URL');
  }

  get jwtSecret(): string {
    return this.getString('JWT_SECRET', 'dev-secret');
  }

  get jwtExpiresIn(): string {
    return this.getString('JWT_EXPIRES_IN', '30m');
  }

  get redisHost(): string {
    return this.getString('REDIS_HOST', 'localhost');
  }

  get redisPort(): number {
    return this.getNumber('REDIS_PORT', 6379);
  }

  get smtpHost(): string {
    return this.getString('SMTP_HOST', 'smtp.qq.com');
  }

  get smtpPort(): number {
    return this.getNumber('SMTP_PORT', 587);
  }

  get smtpSecure(): boolean {
    return this.smtpPort === 465;
  }

  get smtpUser(): string {
    return this.getString('SMTP_USER', '');
  }

  get smtpPass(): string {
    return this.getString('SMTP_PASS', '');
  }

  get smtpFrom(): string {
    return this.getString('SMTP_FROM', this.smtpUser);
  }

  get appPort(): number {
    return this.getNumber('APP_PORT', 3000);
  }

  get userPort(): number {
    return this.getNumber('USER_SERVICE_PORT', 3001);
  }

  get examPort(): number {
    return this.getNumber('EXAM_SERVICE_PORT', 3002);
  }

  get answerPort(): number {
    return this.getNumber('ANSWER_SERVICE_PORT', 3003);
  }

  get analysePort(): number {
    return this.getNumber('ANALYSE_SERVICE_PORT', 3004);
  }

  get examTcpPort(): number {
    return this.getNumber('EXAM_TCP_PORT', 8888);
  }

  private getRequiredString(key: string): string {
    const value = this.configService.get<string>(key);

    if (!value) {
      throw new Error(`${key} is required`);
    }

    return value;
  }

  private getString(key: string, defaultValue: string): string {
    return this.configService.get<string>(key) ?? defaultValue;
  }

  private getNumber(key: string, defaultValue: number): number {
    const value = this.configService.get<string>(key);

    if (!value) {
      return defaultValue;
    }

    const parsed = Number(value);

    if (Number.isNaN(parsed)) {
      throw new Error(`${key} must be a number`);
    }

    return parsed;
  }
}
