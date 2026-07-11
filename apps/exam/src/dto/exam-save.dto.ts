import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ExamSaveDto {
  @ApiProperty({ example: 1, description: '考试 id' })
  @IsNotEmpty({ message: '考试 id 不能为空' })
  id: number;

  @ApiPropertyOptional({ example: '语文测试', description: '考试名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example:
      '[{"type":"radio","question":"最长的河？","options":["选项1","选项2"],"score":5,"answer":"选项1","answerAnalyse":"答案解析"}]',
    description: '考试题目 JSON 字符串',
  })
  @IsString()
  content: string;
}
