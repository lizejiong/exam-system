import { Global, Module } from '@nestjs/common';
import { createClient } from 'redis';
import { AppConfigModule, AppConfigService } from '@app/config';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [AppConfigModule],
  providers: [
    RedisService,
    {
      provide: 'REDIS_CLIENT',
      async useFactory(config: AppConfigService) {
        const client = createClient({
          socket: {
            host: config.redisHost,
            port: config.redisPort,
          },
        });
        await client.connect();
        return client;
      },
      inject: [AppConfigService],
    },
  ],
  exports: [RedisService],
})
export class RedisModule {}
