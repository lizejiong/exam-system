import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ExamModule } from './exam.module';
import { Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { setupSwagger } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(ExamModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  setupSwagger(app, 'Exam Service');

  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      port: 8888,
    },
  });
  await app.startAllMicroservices();

  await app.listen(3002);
}
bootstrap();
