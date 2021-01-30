import { Module } from '@nestjs/common';

import { MeController } from './me.controller';
import { UsersModule } from '../users/users.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [UsersModule, OrdersModule],
  controllers: [MeController],
})
export class MeModule {}
