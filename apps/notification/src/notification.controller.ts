import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { EmailService } from '@app/email';
import { EMAIL_SEND_EVENT, type SendEmailMessage } from '@app/notification';

@Controller()
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(private readonly emailService: EmailService) {}

  @EventPattern(EMAIL_SEND_EVENT)
  async handleSendEmail(
    @Payload() message: SendEmailMessage,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      await this.emailService.sendMail(message);
      channel.ack(originalMessage);
    } catch (error) {
      this.logger.error(error);
      channel.nack(originalMessage, false, false);
    }
  }
}
