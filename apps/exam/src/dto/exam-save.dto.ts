import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ExamSaveDto {
  @IsNotEmpty({ message: '考试 id 不能为空' })
  id: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsString()
  content: string;
}
