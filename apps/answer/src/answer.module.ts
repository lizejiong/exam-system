import { Module } from '@nestjs/common';
import { AnswerController } from './answer.controller';
import { AnswerService } from './answer.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard, CommonModule } from '@app/common';
import { AppConfigModule, AppConfigService } from '@app/config';
import { PrismaModule } from '@app/prisma';
import { ExcelModule } from '@app/excel';
import { RedisModule } from '@app/redis';

@Module({
  imports: [
    PrismaModule,
    CommonModule,
    RedisModule,
    ClientsModule.registerAsync([
      {
        name: 'EXAM_SERVICE',
        imports: [AppConfigModule],
        inject: [AppConfigService],
        useFactory: (config: AppConfigService) => ({
          transport: Transport.TCP,
          options: {
            port: config.examTcpPort,
          },
        }),
      },
    ]),
    ExcelModule,
  ],
  controllers: [AnswerController],
  providers: [
    AnswerService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AnswerModule {}
