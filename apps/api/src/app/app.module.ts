import {
  ClassSerializerInterceptor,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { APP_GUARD, APP_PIPE, APP_INTERCEPTOR } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { OrdersModule } from './modules/orders/orders.module';
import { MeModule } from './modules/me/me.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({ uri: process.env.DB_URL }),
    }),
    UsersModule,
    AuthModule,
    OrdersModule,
    MeModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'pdrc'),
      exclude: ['/api*'],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_PIPE, useClass: ValidationPipe },
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
  ],
})
export class AppModule {}
