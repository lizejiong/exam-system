import { PrismaService } from '@app/prisma';
import { RedisService } from '@app/redis';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { EmailService } from '@app/email';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
  ) {}

  private logger = new Logger();

  async register(user: RegisterUserDto) {
    const captcha = await this.redisService.get(`captcha_${user.email}`);

    if (!captcha) {
      throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
    }

    if (user.captcha !== captcha) {
      throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
    }

    const foundUser = await this.prismaService.user.findUnique({
      where: {
        username: user.username,
      },
    });

    if (foundUser) {
      throw new HttpException('用户已存在', HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.prismaService.user.create({
        data: {
          username: user.username,
          password: user.password,
          email: user.email,
        },
        select: {
          id: true,
          username: true,
          email: true,
          createTime: true,
        },
      });
    } catch (e) {
      this.logger.error(e, UserService);
      return null;
    }
  }

  async generateCaptcha(address: string) {
    const captcha = Math.random().toString(36).substring(2, 8);
    this.redisService.set(`captcha_${address}`, captcha, 300);
    await this.emailService.sendMail({
      to: address,
      subject: '注册验证码',
      html: `<p>你的注册验证码是 ${captcha}</p>`,
    });
    return captcha;
  }

  async generateUpdatePasswordCaptcha(address: string) {
    if (!address) {
      throw new BadRequestException('邮箱地址不能为空');
    }

    const code = Math.random().toString().slice(2, 8);

    await this.redisService.set(
      `update_password_captcha_${address}`,
      code,
      10 * 60,
    );

    await this.emailService.sendMail({
      to: address,
      subject: '更改密码验证码',
      html: `<p>你的更改密码验证码是 ${code}</p>`,
    });

    return code;
  }

  async login(loginUserDto: LoginUserDto) {
    const foundUser = await this.prismaService.user.findUnique({
      where: {
        username: loginUserDto.username,
      },
    });

    if (!foundUser) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }

    if (foundUser.password !== loginUserDto.password) {
      throw new HttpException('密码错误', HttpStatus.BAD_REQUEST);
    }

    const { password, ...user } = foundUser;

    return {
      user,
      token: this.jwtService.sign({
        userId: user.id,
        username: user.username,
      }),
    };
  }

  async updatePassword(passwordDto: UpdateUserPasswordDto) {
    const captcha = await this.redisService.get(
      `update_password_captcha_${passwordDto.email}`,
    );

    if (!captcha) {
      throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
    }

    if (passwordDto.captcha !== captcha) {
      throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
    }

    const foundUser = await this.prismaService.user.findUnique({
      where: {
        username: passwordDto.username,
      },
    });

    if (!foundUser) {
      throw new HttpException('鐢ㄦ埛涓嶅瓨鍦?', HttpStatus.BAD_REQUEST);
    }

    try {
      await this.prismaService.user.update({
        where: {
          id: foundUser.id,
        },
        data: {
          password: passwordDto.password,
        },
      });
      return '密码修改成功';
    } catch (e) {
      this.logger.error(e, UserService);
      return '密码修改失败';
    }
  }
}
