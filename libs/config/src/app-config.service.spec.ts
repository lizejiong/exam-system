import { ConfigService } from '@nestjs/config';
import { AppConfigService } from './app-config.service';

describe('AppConfigService', () => {
  function createService(values: Record<string, string | undefined>) {
    const configService = {
      get: jest.fn((key: string) => values[key]),
    } as unknown as ConfigService;

    return new AppConfigService(configService);
  }

  it('uses development defaults for local service ports', () => {
    const service = createService({});

    expect(service.appPort).toBe(3000);
    expect(service.userPort).toBe(3001);
    expect(service.examPort).toBe(3002);
    expect(service.answerPort).toBe(3003);
    expect(service.analysePort).toBe(3004);
    expect(service.examTcpPort).toBe(8888);
  });

  it('parses numeric environment variables', () => {
    const service = createService({
      USER_SERVICE_PORT: '4101',
      REDIS_PORT: '6380',
      SMTP_PORT: '465',
    });

    expect(service.userPort).toBe(4101);
    expect(service.redisPort).toBe(6380);
    expect(service.smtpPort).toBe(465);
    expect(service.smtpSecure).toBe(true);
  });

  it('uses RabbitMQ defaults for local async messages', () => {
    const service = createService({});

    expect(service.rabbitmqUrl).toBe('amqp://localhost:5672');
    expect(service.emailQueue).toBe('email_queue');
  });

  it('builds local gateway targets from service ports', () => {
    const service = createService({
      USER_SERVICE_PORT: '4101',
      EXAM_SERVICE_PORT: '4102',
      ANSWER_SERVICE_PORT: '4103',
      ANALYSE_SERVICE_PORT: '4104',
    });

    expect(service.userServiceUrl).toBe('http://localhost:4101');
    expect(service.examServiceUrl).toBe('http://localhost:4102');
    expect(service.answerServiceUrl).toBe('http://localhost:4103');
    expect(service.analyseServiceUrl).toBe('http://localhost:4104');
  });

  it('requires DATABASE_URL before Prisma starts', () => {
    const service = createService({});

    expect(() => service.databaseUrl).toThrow('DATABASE_URL is required');
  });
});
