import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from './http-exception.filter';
import { ResponseInterceptor } from './response.interceptor';
import { AppConfigModule, AppConfigService } from '@app/config';

type JwtSignOptions = NonNullable<JwtModuleOptions['signOptions']>;

@Module({
  imports: [
    AppConfigModule,
    JwtModule.registerAsync({
      global: true,
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (config: AppConfigService): JwtModuleOptions => ({
        secret: config.jwtSecret,
        signOptions: {
          expiresIn: config.jwtExpiresIn as JwtSignOptions['expiresIn'],
        },
      }),
    }),
  ],
  providers: [
    CommonService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
  exports: [CommonService],
})
export class CommonModule {}
