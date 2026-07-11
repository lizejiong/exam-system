import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject } from 'class-validator';
import type { AnswerContent } from '../grading';

export class AnswerSubmitDto {
  @ApiProperty({ example: 1, description: '考试 id' })
  @IsNotEmpty({ message: '考试 id 不能为空' })
  examId: number;

  @ApiProperty({
    example: {
      0: '选项1',
      1: ['选项1', '选项2'],
      2: '填空答案',
    },
    description: '用户答案，key 为题目下标',
  })
  @IsObject({ message: '答案必须是对象' })
  answers: AnswerContent;
}
