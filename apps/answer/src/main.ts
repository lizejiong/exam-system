import { NestFactory } from '@nestjs/core';
import { AnswerModule } from './answer.module';
import { ValidationPipe } from '@nestjs/common';
import { setupSwagger } from '@app/common';
import { AppConfigService } from '@app/config';

async function bootstrap() {
  const app = await NestFactory.create(AnswerModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  setupSwagger(app, 'Answer Service');
  const config = app.get(AppConfigService);
  await app.listen(config.answerPort);
}
bootstrap();
