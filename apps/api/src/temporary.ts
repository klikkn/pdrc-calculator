import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ADMIN_DOCUMENT, ORDER_1, USER_DOCUMENT } from '../mocks';
import { AppModule } from './app/app.module';
import { Order } from './app/modules/orders/order.schema';
import { User } from './app/modules/users/user.schema';

export async function createTemporaryApp() {
  const uri = await new MongoMemoryServer().getUri();

  const module: TestingModule = await Test.createTestingModule({
    imports: [AppModule.register({ uri })],
  }).compile();

  const app = module.createNestApplication();

  const userModel = module.get(`${User.name}Model`);
  const orderModel = module.get(`${Order.name}Model`);

  await userModel.create(ADMIN_DOCUMENT);
  const user1 = await userModel.create(USER_DOCUMENT);

  await orderModel.create({ ...ORDER_1, ownerId: user1._id });
  await orderModel.create({ ...ORDER_1, ownerId: user1._id });

  return app;
}
