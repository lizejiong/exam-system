import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AnswerModule } from './answer.module';
import { ValidationPipe } from '@nestjs/common';
import { setupSwagger } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(AnswerModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  setupSwagger(app, 'Answer Service');
  await app.listen(3003);
}
bootstrap();
