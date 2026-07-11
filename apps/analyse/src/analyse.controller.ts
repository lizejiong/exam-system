import { Controller, Get, Param, Query } from '@nestjs/common';
import { AnalyseService } from './analyse.service';
import { RequireLogin, UserInfo } from '@app/common';

@Controller()
export class AnalyseController {
  constructor(private readonly analyseService: AnalyseService) {}

  @Get('ranking/:examId')
  @RequireLogin()
  async ranking(
    @Param('examId') examId: string,
    @Query('limit') limit: string,
    @UserInfo('userId') userId: number,
  ) {
    return this.analyseService.ranking(+examId, userId, Number(limit));
  }
}
