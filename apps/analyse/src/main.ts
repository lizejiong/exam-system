import { NestFactory } from '@nestjs/core';
import { AnalyseModule } from './analyse.module';
import { setupSwagger } from '@app/common';
import { AppConfigService } from '@app/config';

async function bootstrap() {
  const app = await NestFactory.create(AnalyseModule);
  setupSwagger(app, 'Analyse Service');
  const config = app.get(AppConfigService);
  await app.listen(config.analysePort);
}
bootstrap();
