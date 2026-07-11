import { NestFactory } from '@nestjs/core';
import { ExamModule } from './exam.module';
import { Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { setupSwagger } from '@app/common';
import { AppConfigService } from '@app/config';

async function bootstrap() {
  const app = await NestFactory.create(ExamModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  setupSwagger(app, 'Exam Service');
  const config = app.get(AppConfigService);

  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      port: config.examTcpPort,
    },
  });
  await app.startAllMicroservices();

  await app.listen(config.examPort);
}
bootstrap();
