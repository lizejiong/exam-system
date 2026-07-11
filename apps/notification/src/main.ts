import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppConfigService } from '@app/config';
import { NotificationModule } from './notification.module';

async function bootstrap() {
  const app = await NestFactory.create(NotificationModule);
  const config = app.get(AppConfigService);

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [config.rabbitmqUrl],
      queue: config.emailQueue,
      queueOptions: {
        durable: true,
      },
      noAck: false,
    },
  });

  await app.startAllMicroservices();
  await app.init();

  Logger.log(
    `Notification service is listening queue "${config.emailQueue}"`,
    'Bootstrap',
  );
}

bootstrap();
