import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'pdrc'),
      exclude: ['/api*'],
    }),
    MongooseModule.forRoot(process.env.DB_URL), UsersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
