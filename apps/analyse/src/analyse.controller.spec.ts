import { Test, TestingModule } from '@nestjs/testing';
import { AnalyseController } from './analyse.controller';
import { AnalyseService } from './analyse.service';

jest.mock('@app/prisma', () => ({
  PrismaService: class PrismaService {},
}));

jest.mock('@app/redis', () => ({
  RedisService: class RedisService {},
}));

describe('AnalyseController', () => {
  let analyseController: AnalyseController;
  const analyseService = {
    ranking: jest.fn(),
  };

  beforeEach(async () => {
    analyseService.ranking.mockResolvedValue({
      exam: {
        id: 1,
        name: 'Exam',
      },
      list: [],
    });

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AnalyseController],
      providers: [
        {
          provide: AnalyseService,
          useValue: analyseService,
        },
      ],
    }).compile();

    analyseController = app.get<AnalyseController>(AnalyseController);
  });

  it('returns exam ranking', async () => {
    await expect(analyseController.ranking('1', '10', 2)).resolves.toEqual({
      exam: {
        id: 1,
        name: 'Exam',
      },
      list: [],
    });
    expect(analyseService.ranking).toHaveBeenCalledWith(1, 2, 10);
  });
});
