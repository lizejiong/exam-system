jest.mock('@app/prisma', () => ({
  PrismaService: class PrismaService {},
}));

import { UserController } from './user.controller';

describe('UserController', () => {
  it('requests register captcha through UserService', async () => {
    const userService = {
      generateCaptcha: jest.fn().mockResolvedValue('123456'),
    };
    const controller = new UserController(userService as never);

    const result = await controller.getRegisterCaptcha('user@example.com');

    expect(userService.generateCaptcha).toHaveBeenCalledWith(
      'user@example.com',
    );
    expect(typeof result).toBe('string');
  });
});
