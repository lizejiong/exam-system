import { of } from 'rxjs';
import { EMAIL_SEND_EVENT } from './notification.constants';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  it('emits email send messages to RabbitMQ', async () => {
    const client = {
      emit: jest.fn(() => of(undefined)),
    };
    const service = new NotificationService(client as never);
    const message = {
      to: 'user@example.com',
      subject: '验证码',
      html: '<p>123456</p>',
    };

    await service.sendEmail(message);

    expect(client.emit).toHaveBeenCalledWith(EMAIL_SEND_EVENT, message);
  });
});
