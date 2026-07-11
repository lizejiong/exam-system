import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class UpdateUserPasswordDto {
  @ApiProperty({ example: 'admin', description: '用户名' })
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @ApiProperty({ example: 'new123456', description: '新密码，至少 6 位' })
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码不能少于 6 位' })
  password: string;

  @ApiProperty({ example: 'admin@example.com', description: '邮箱' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  @IsEmail({}, { message: '不是合法的邮箱格式' })
  email: string;

  @ApiProperty({ example: '123456', description: '邮箱验证码' })
  @IsNotEmpty({ message: '验证码不能为空' })
  captcha: string;
}
