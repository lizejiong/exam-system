import { INestApplication } from '@nestjs/common';
import { AppConfigService } from '@app/config';

type CreateProxyMiddleware = (options: {
  target: string;
  changeOrigin: boolean;
  pathRewrite: Record<string, string>;
}) => never;

export async function setupGatewayProxy(
  app: INestApplication,
  config: AppConfigService,
) {
  const { createProxyMiddleware } = await import('http-proxy-middleware');
  const proxyFactory = createProxyMiddleware as CreateProxyMiddleware;

  registerProxy(app, proxyFactory, '/api/user', config.userServiceUrl);
  registerProxy(app, proxyFactory, '/api/exam', config.examServiceUrl);
  registerProxy(app, proxyFactory, '/api/answer', config.answerServiceUrl);
  registerProxy(app, proxyFactory, '/api/analyse', config.analyseServiceUrl);
}

function registerProxy(
  app: INestApplication,
  createProxyMiddleware: CreateProxyMiddleware,
  prefix: string,
  target: string,
) {
  app.use(
    prefix,
    createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: {
        [`^${prefix}`]: '',
      },
    }),
  );
}
