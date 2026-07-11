import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ExamAddDto {
  @ApiProperty({ example: '语文测试', description: '考试名称' })
  @IsNotEmpty({ message: '考试名不能为空' })
  name: string;
}
