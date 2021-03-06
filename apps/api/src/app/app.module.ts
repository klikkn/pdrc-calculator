import {
  ClassSerializerInterceptor,
  DynamicModule,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { APP_GUARD, APP_PIPE, APP_INTERCEPTOR } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MongooseModule } from '@nestjs/mongoose';
import { GoogleRecaptchaModule } from '@nestlab/google-recaptcha';

import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { OrdersModule } from './modules/orders/orders.module';
import { MeModule } from './modules/me/me.module';
import { AppController } from './app.controller';

@Module({})
export class AppModule {
  static register({ uri }: { uri: string }): DynamicModule {
    return {
      module: AppModule,
      imports: [
        MongooseModule.forRoot(uri),
        UsersModule,
        AuthModule,
        OrdersModule,
        MeModule,
        GoogleRecaptchaModule.forRoot({
          secretKey: process.env.GOOGLE_RECAPTCHA_SECRET_KEY,
          response: (req) => req.headers.recaptcha,
          skipIf:
            process.env.GOOGLE_RECAPTCHA_ENABLED !== 'true' &&
            process.env.NODE_ENV !== 'production',
          agent: null,
        }),
        ServeStaticModule.forRoot({
          rootPath: join(__dirname, '..', 'pdrc'),
          exclude: ['/api*'],
        }),
      ],
      controllers: [AppController],
      providers: [
        { provide: APP_GUARD, useClass: JwtAuthGuard },
        { provide: APP_PIPE, useClass: ValidationPipe },
        { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
      ],
    };
  }
}
