import { Inject, Injectable } from '@nestjs/common';
import type { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  @Inject('REDIS_CLIENT')
  private redisClient: RedisClientType;

  async keys(pattern: string) {
    return await this.redisClient.keys(pattern);
  }

  async get(key: string) {
    return await this.redisClient.get(key);
  }

  async set(key: string, value: string | number, ttl?: number) {
    await this.redisClient.set(key, value);

    if (ttl) {
      await this.redisClient.expire(key, ttl);
    }
  }

  async del(key: string) {
    await this.redisClient.del(key);
  }

  async hSet(key: string, value: Record<string, string | number>) {
    await this.redisClient.hSet(key, value);
  }

  async hGetAll(key: string) {
    return await this.redisClient.hGetAll(key);
  }

  async zScore(key: string, member: string) {
    return await this.redisClient.zScore(key, member);
  }

  async zAdd(key: string, member: string, score: number) {
    await this.redisClient.zAdd(key, {
      value: member,
      score,
    });
  }

  async zRangeWithScores(key: string, start: number, stop: number) {
    return await this.redisClient.zRangeWithScores(key, start, stop, {
      REV: true,
    });
  }
}
