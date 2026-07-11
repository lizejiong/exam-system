import { Module } from '@nestjs/common';
import { EmailModule } from '@app/email';
import { NotificationController } from './notification.controller';

@Module({
  imports: [EmailModule],
  controllers: [NotificationController],
})
export class NotificationModule {}
