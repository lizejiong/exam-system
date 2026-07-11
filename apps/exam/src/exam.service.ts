import { PrismaService } from '@app/prisma';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ExamAddDto } from './dto/exam-add.dto';
import { ExamSaveDto } from './dto/exam-save.dto';

type AnswerExamQuestion = {
  type: 'radio' | 'checkbox' | 'blank';
  question: string;
  options: string[];
  score: number;
};

@Injectable()
export class ExamService {
  @Inject(PrismaService)
  private prismaService: PrismaService;

  async add(dto: ExamAddDto, userId: number) {
    return this.prismaService.exam.create({
      data: {
        name: dto.name,
        content: '',
        createUser: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  async list(userId: number, bin: string) {
    return this.prismaService.exam.findMany({
      where:
        bin !== undefined
          ? {
              createUserId: userId,
              isDelete: true,
            }
          : {
              createUserId: userId,
              isDelete: false,
            },
      orderBy: {
        updateTime: 'desc',
      },
    });
  }

  async delete(userId: number, id: number) {
    return this.prismaService.exam.update({
      where: {
        id,
        createUserId: userId,
      },
      data: {
        isDelete: true,
      },
    });
  }

  async save(userId: number, dto: ExamSaveDto) {
    return this.prismaService.exam.update({
      where: {
        id: dto.id,
        createUserId: userId,
      },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        content: dto.content,
      },
    });
  }

  async publish(userId: number, id: number) {
    return this.prismaService.exam.update({
      where: {
        id,
        createUserId: userId,
      },
      data: {
        isPublish: true,
      },
    });
  }

  async unpublish(userId: number, id: number) {
    return this.prismaService.exam.update({
      where: {
        id,
        createUserId: userId,
      },
      data: {
        isPublish: false,
      },
    });
  }

  async find(userId: number, id: number) {
    return this.prismaService.exam.findFirst({
      where: {
        id,
        createUserId: userId,
        isDelete: false,
      },
    });
  }

  async answer(id: number) {
    const exam = await this.prismaService.exam.findFirst({
      where: {
        id,
        isDelete: false,
        isPublish: true,
      },
    });

    if (!exam) {
      throw new NotFoundException('Exam does not exist or is not published');
    }

    return {
      ...exam,
      content: JSON.stringify(this.toAnswerQuestions(exam.content)),
    };
  }

  private toAnswerQuestions(content: string): AnswerExamQuestion[] {
    if (!content.trim()) return [];

    try {
      const parsed = JSON.parse(content) as unknown;
      if (!Array.isArray(parsed)) return [];

      return parsed
        .filter((item): item is AnswerExamQuestion => {
          if (!item || typeof item !== 'object') return false;
          const question = item as Partial<AnswerExamQuestion>;
          return (
            (question.type === 'radio' ||
              question.type === 'checkbox' ||
              question.type === 'blank') &&
            typeof question.question === 'string' &&
            Array.isArray(question.options) &&
            typeof question.score === 'number'
          );
        })
        .map((question) => ({
          type: question.type,
          question: question.question,
          options: question.options,
          score: question.score,
        }));
    } catch {
      return [];
    }
  }
}
