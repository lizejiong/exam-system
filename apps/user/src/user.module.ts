import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { RedisModule } from '@app/redis';
import { PrismaModule } from '@app/prisma';
import { NotificationModule } from '@app/notification';
import { AuthGuard, CommonModule } from '@app/common';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [RedisModule, PrismaModule, NotificationModule, CommonModule],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class UserModule {}
