import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AnalyseModule } from './analyse.module';
import { setupSwagger } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(AnalyseModule);
  setupSwagger(app, 'Analyse Service');
  await app.listen(3004);
}
bootstrap();
