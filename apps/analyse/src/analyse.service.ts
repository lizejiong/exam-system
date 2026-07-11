import { PrismaService } from '@app/prisma';
import { RedisService } from '@app/redis';
import { ForbiddenException, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AnalyseService {
  @Inject(RedisService)
  private redisService: RedisService;

  @Inject(PrismaService)
  private prismaService: PrismaService;

  async ranking(examId: number, userId: number, limit = 10) {
    const exam = await this.prismaService.exam.findFirst({
      where: {
        id: examId,
        createUserId: userId,
        isDelete: false,
      },
    });

    if (!exam) {
      throw new ForbiddenException('Only the creator can view exam ranking');
    }

    const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 10;
    const rows = await this.redisService.zRangeWithScores(
      this.getRankingKey(examId),
      0,
      safeLimit - 1,
    );

    const list = await Promise.all(
      rows.map(async (row, index) => {
        const userId = Number(row.value);
        const user = await this.redisService.hGetAll(
          this.getRankingUserKey(examId, userId),
        );

        return {
          rank: index + 1,
          userId,
          username: user.username ?? `用户 ${userId}`,
          score: row.score,
          totalScore: Number(user.totalScore ?? 0),
          answerId: Number(user.answerId ?? 0),
          createTime: user.createTime ?? '',
        };
      }),
    );

    return {
      exam: {
        id: exam.id,
        name: exam.name,
      },
      list,
    };
  }

  private getRankingKey(examId: number) {
    return `exam:${examId}:ranking`;
  }

  private getRankingUserKey(examId: number, userId: number) {
    return `exam:${examId}:ranking:user:${userId}`;
  }
}
