import { PrismaService } from '@app/prisma';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AnswerAddDto } from './dto/answer-add.dto';
import { AnswerSubmitDto } from './dto/answer-submit.dto';
import {
  AnswerContent,
  GradeDetail,
  gradeExam,
  parseExamQuestions,
} from './grading';

@Injectable()
export class AnswerService {
  @Inject(PrismaService)
  private prismaService: PrismaService;

  async add(dto: AnswerAddDto, userId: number) {
    let answers: AnswerContent;
    try {
      answers = JSON.parse(dto.content) as AnswerContent;
    } catch {
      answers = {};
    }

    return this.submit({ examId: dto.examId, answers }, userId);
  }

  async submit(dto: AnswerSubmitDto, userId: number) {
    const exam = await this.prismaService.exam.findFirst({
      where: {
        id: dto.examId,
        isDelete: false,
        isPublish: true,
      },
    });

    if (!exam) {
      throw new NotFoundException('Exam does not exist or is not published');
    }

    let questions;
    try {
      questions = parseExamQuestions(exam.content);
    } catch {
      throw new BadRequestException('Invalid exam content');
    }

    const gradeResult = gradeExam(questions, dto.answers);
    const answer = await this.prismaService.answer.create({
      data: {
        content: JSON.stringify(dto.answers),
        score: gradeResult.score,
        totalScore: gradeResult.totalScore,
        detail: JSON.stringify(gradeResult.detail),
        examSnapshot: JSON.stringify(questions),
        answerer: {
          connect: {
            id: userId,
          },
        },
        exam: {
          connect: {
            id: dto.examId,
          },
        },
      },
      include: {
        exam: true,
        answerer: true,
      },
    });

    return {
      id: answer.id,
      examId: answer.examId,
      score: answer.score,
      totalScore: answer.totalScore,
      detail: gradeResult.detail,
      createTime: answer.createTime,
      answerer: {
        id: answer.answerer.id,
        username: answer.answerer.username,
      },
      exam: {
        id: answer.exam.id,
        name: answer.exam.name,
      },
    };
  }

  async analyse(examId: number, userId: number) {
    const exam = await this.prismaService.exam.findFirst({
      where: {
        id: examId,
        createUserId: userId,
        isDelete: false,
      },
    });

    if (!exam) {
      throw new ForbiddenException('Only the creator can view exam analysis');
    }

    const answers = await this.prismaService.answer.findMany({
      where: {
        examId,
      },
      include: {
        answerer: true,
      },
      orderBy: {
        createTime: 'desc',
      },
    });

    const scores = answers.map((item) => item.score);
    const totalScore = answers[0]?.totalScore ?? 0;
    const questionMap = new Map<
      number,
      {
        index: number;
        question: string;
        correctCount: number;
        totalCount: number;
      }
    >();

    answers.forEach((answer) => {
      const detail = this.safeParseDetail(answer.detail);
      detail.forEach((item) => {
        const current =
          questionMap.get(item.index) ??
          {
            index: item.index,
            question: item.question,
            correctCount: 0,
            totalCount: 0,
          };

        current.totalCount += 1;
        if (item.isCorrect) current.correctCount += 1;
        questionMap.set(item.index, current);
      });
    });

    return {
      exam: {
        id: exam.id,
        name: exam.name,
        isPublish: exam.isPublish,
      },
      totalSubmit: answers.length,
      totalScore,
      averageScore:
        answers.length === 0
          ? 0
          : Number(
              (
                scores.reduce((sum, score) => sum + score, 0) / answers.length
              ).toFixed(1),
            ),
      maxScore: scores.length === 0 ? 0 : Math.max(...scores),
      minScore: scores.length === 0 ? 0 : Math.min(...scores),
      records: answers.map((answer) => ({
        id: answer.id,
        score: answer.score,
        totalScore: answer.totalScore,
        createTime: answer.createTime,
        answerer: {
          id: answer.answerer.id,
          username: answer.answerer.username,
        },
      })),
      questions: [...questionMap.values()].map((item) => ({
        ...item,
        correctRate:
          item.totalCount === 0
            ? 0
            : Number((item.correctCount / item.totalCount).toFixed(2)),
      })),
    };
  }

  async list(examId: number) {
    return this.prismaService.answer.findMany({
      where: {
        examId,
      },
      include: {
        exam: true,
        answerer: true,
      },
    });
  }

  async find(id: number) {
    return this.prismaService.answer.findUnique({
      where: {
        id,
      },
      include: {
        exam: true,
        answerer: true,
      },
    });
  }

  private safeParseDetail(detail: string): GradeDetail[] {
    try {
      const parsed = JSON.parse(detail) as unknown;
      return Array.isArray(parsed) ? (parsed as GradeDetail[]) : [];
    } catch {
      return [];
    }
  }
}
