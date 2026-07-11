import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AnswerAddDto {
  @ApiProperty({
    example: '{"0":"选项1","1":["选项1","选项2"]}',
    description: '答卷内容 JSON 字符串，兼容旧接口',
  })
  @IsNotEmpty({ message: '答卷内容不能为空' })
  @IsString()
  content: string;

  @ApiProperty({ example: 1, description: '考试 id' })
  @IsNotEmpty({ message: '考试 id 不能为空' })
  examId: number;
}
