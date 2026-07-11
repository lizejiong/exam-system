import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { EMAIL_SEND_EVENT, NOTIFICATION_CLIENT } from './notification.constants';
import type { SendEmailMessage } from './notification.types';

@Injectable()
export class NotificationService {
  constructor(
    @Inject(NOTIFICATION_CLIENT)
    private readonly client: ClientProxy,
  ) {}

  async sendEmail(message: SendEmailMessage) {
    await firstValueFrom(this.client.emit(EMAIL_SEND_EVENT, message));
  }
}
