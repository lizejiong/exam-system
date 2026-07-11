jest.mock('@app/prisma', () => ({
  PrismaService: class PrismaService {},
}));

import { UserService } from './user.service';

describe('UserService', () => {
  it('stores captcha in Redis and emits async email message', async () => {
    const redisService = {
      set: jest.fn().mockResolvedValue(undefined),
    };
    const notificationService = {
      sendEmail: jest.fn().mockResolvedValue(undefined),
    };
    const service = new UserService(
      {} as never,
      redisService as never,
      notificationService as never,
      {} as never,
    );

    const captcha = await service.generateCaptcha('user@example.com');

    expect(captcha).toHaveLength(6);
    expect(redisService.set).toHaveBeenCalledWith(
      'captcha_user@example.com',
      captcha,
      300,
    );
    expect(notificationService.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        html: expect.stringContaining(captcha),
      }),
    );
  });
});
