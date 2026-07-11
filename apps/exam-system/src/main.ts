import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfigService } from '@app/config';
import { setupGatewayProxy } from './gateway-proxy';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(AppConfigService);
  await setupGatewayProxy(app, config);
  await app.listen(config.appPort);
}
bootstrap();
