import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ExamService } from './exam.service';
import { RequireLogin, UserInfo } from '@app/common';
import { ExamAddDto } from './dto/exam-add.dto';
import { ExamSaveDto } from './dto/exam-save.dto';

@Controller()
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Post('add')
  @RequireLogin()
  async add(@Body() dto: ExamAddDto, @UserInfo('userId') userId: number) {
    return this.examService.add(dto, userId);
  }

  @Get('list')
  @RequireLogin()
  async list(@UserInfo('userId') userId: number, @Query('bin') bin: string) {
    return this.examService.list(userId, bin);
  }

  @Delete('delete/:id')
  @RequireLogin()
  async del(@UserInfo('userId') userId: number, @Param('id') id: string) {
    return this.examService.delete(userId, +id);
  }

  @Post('save')
  @RequireLogin()
  async save(@UserInfo('userId') userId: number, @Body() dto: ExamSaveDto) {
    return this.examService.save(userId, dto);
  }

  @Get('publish/:id')
  @RequireLogin()
  async publish(@UserInfo('userId') userId: number, @Param('id') id: string) {
    return this.examService.publish(userId, +id);
  }

  @Get('unpublish/:id')
  @RequireLogin()
  async unpublish(@UserInfo('userId') userId: number, @Param('id') id: string) {
    return this.examService.unpublish(userId, +id);
  }

  @Get('answer/:id')
  @RequireLogin()
  async answer(@Param('id') id: string) {
    return this.examService.answer(+id);
  }

  @Get('find/:id')
  @RequireLogin()
  async find(@UserInfo('userId') userId: number, @Param('id') id: string) {
    return this.examService.find(userId, +id);
  }
}
