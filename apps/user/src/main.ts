import { NestFactory } from '@nestjs/core';
import { UserModule } from './user.module';
import { ValidationPipe } from '@nestjs/common';
import { setupSwagger } from '@app/common';
import { AppConfigService } from '@app/config';

async function bootstrap() {
  const app = await NestFactory.create(UserModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  setupSwagger(app, 'User Service');

  const config = app.get(AppConfigService);
  await app.listen(config.userPort);
}
bootstrap();
