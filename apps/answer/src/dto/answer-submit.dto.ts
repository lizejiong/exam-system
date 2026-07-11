import { IsNotEmpty, IsObject } from 'class-validator';
import type { AnswerContent } from '../grading';

export class AnswerSubmitDto {
  @IsNotEmpty({ message: '考试 id 不能为空' })
  examId: number;

  @IsObject({ message: '答案必须是对象' })
  answers: AnswerContent;
}
