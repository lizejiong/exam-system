import { NotificationController } from './notification.controller';

describe('NotificationController', () => {
  it('sends email and acknowledges the RabbitMQ message', async () => {
    const emailService = {
      sendMail: jest.fn().mockResolvedValue(undefined),
    };
    const channel = {
      ack: jest.fn(),
      nack: jest.fn(),
    };
    const originalMessage = { fields: { deliveryTag: 1 } };
    const context = {
      getChannelRef: () => channel,
      getMessage: () => originalMessage,
    };
    const controller = new NotificationController(emailService as never);
    const message = {
      to: 'user@example.com',
      subject: '验证码',
      html: '<p>123456</p>',
    };

    await controller.handleSendEmail(message, context as never);

    expect(emailService.sendMail).toHaveBeenCalledWith(message);
    expect(channel.ack).toHaveBeenCalledWith(originalMessage);
    expect(channel.nack).not.toHaveBeenCalled();
  });
});
