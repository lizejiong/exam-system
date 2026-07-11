import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppConfigModule, AppConfigService } from '@app/config';
import { NOTIFICATION_CLIENT } from './notification.constants';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: NOTIFICATION_CLIENT,
        imports: [AppConfigModule],
        inject: [AppConfigService],
        useFactory: (config: AppConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.rabbitmqUrl],
            queue: config.emailQueue,
            queueOptions: {
              durable: true,
            },
          },
        }),
      },
    ]),
  ],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
