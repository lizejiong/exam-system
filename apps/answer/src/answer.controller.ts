import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { AnswerService } from './answer.service';
import { RequireLogin, UserInfo } from '@app/common';
import { AnswerAddDto } from './dto/answer-add.dto';
import { ExcelService } from '@app/excel';
import { AnswerSubmitDto } from './dto/answer-submit.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('answer')
@ApiBearerAuth()
@Controller()
export class AnswerController {
  @Inject(ExcelService)
  excelService: ExcelService;

  constructor(private readonly answerService: AnswerService) {}

  @Post('add')
  @RequireLogin()
  async add(@Body() addDto: AnswerAddDto, @UserInfo('userId') userId: number) {
    return this.answerService.add(addDto, userId);
  }

  @Post('submit')
  @RequireLogin()
  async submit(
    @Body() submitDto: AnswerSubmitDto,
    @UserInfo('userId') userId: number,
  ) {
    return this.answerService.submit(submitDto, userId);
  }

  @Get('analyse/:examId')
  @RequireLogin()
  async analyse(
    @Param('examId') examId: string,
    @UserInfo('userId') userId: number,
  ) {
    return this.answerService.analyse(+examId, userId);
  }

  @Get('list')
  @RequireLogin()
  async list(@Query('examId') examId: string) {
    if (!examId) {
      throw new BadRequestException('examId 不能为空');
    }
    return this.answerService.list(+examId);
  }

  @Get('find/:id')
  @RequireLogin()
  async find(@Param('id') id: string) {
    return this.answerService.find(+id);
  }

  @Get('export')
  @RequireLogin()
  async export(@Query('examId') examId: string) {
    if (!examId) {
      throw new BadRequestException('examId 不能为空');
    }

    const data = await this.answerService.list(+examId);

    const columns = [
      { header: 'ID', key: 'id', width: 20 },
      { header: '分数', key: 'score', width: 30 },
      { header: '答题人', key: 'answerer', width: 30 },
      { header: '试卷', key: 'exam', width: 30 },
      { header: '创建时间', key: 'createTime', width: 30 },
    ];

    const res = data.map((item) => {
      return {
        id: item.id,
        score: item.score,
        answerer: item.answerer.username,
        exam: item.exam.name,
        createTime: item.createTime,
      };
    });
    return this.excelService.export(columns, res, 'answers.xlsx');
  }
}
