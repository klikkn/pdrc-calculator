import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [MongooseModule.forRoot(process.env.DB_URL), UsersModule],
  providers: [],
})
export class AppModule {}
