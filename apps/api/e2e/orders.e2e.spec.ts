import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model } from 'mongoose';

import { Role } from '@pdrc/api-interfaces';

import { AppModule } from '../src/app/app.module';
import { Order, OrderDocument } from '../src/app/modules/orders/order.schema';
import { User, UserDocument } from '../src/app/modules/users/user.schema';
import { ORDER_1 } from '../mocks';

describe('Orders e2e', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let module: TestingModule;
  let orderModel: Model<OrderDocument>;
  let userModel: Model<UserDocument>;
  let regularUser: UserDocument;
  let bearerToken: string;

  beforeAll(async () => {
    mongod = new MongoMemoryServer();
    const uri = await mongod.getUri();

    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule.register({ uri })],
    }).compile();

    app = module.createNestApplication();
    orderModel = module.get(`${Order.name}Model`);
    userModel = module.get(`${User.name}Model`);
    await app.init();

    regularUser = await userModel.create({
      email: 'user1@google.com',
      password: 'password',
      role: Role.User,
    });
  });

  afterAll(async () => {
    await module.close();
    await mongod.stop();
  });

  describe('Role: admin', () => {
    beforeAll(async () => {
      const admin = {
        email: 'admin@google.com',
        password: 'password',
        role: Role.Admin,
      };

      await userModel.create(admin);
      const { body } = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: admin.email, password: admin.password });
      bearerToken = `Bearer ${body.access_token}`;
    });

    beforeEach(async () => {
      await orderModel.deleteMany();
    });

    it(`can get all orders`, async () => {
      await orderModel.create({ ...ORDER_1, ownerId: regularUser._id });
      await request(app.getHttpServer())
        .get(`/orders`)
        .set('Authorization', bearerToken)
        .expect(function ({ body }) {
          if (!body) throw new Error('Body is undefined');
          if (!body.length) throw new Error('Body should have one order');
        })
        .expect(200);
    });

    it(`can get one order`, async () => {
      const newOrder = await orderModel.create({
        ...ORDER_1,
        ownerId: regularUser._id,
      });

      await request(app.getHttpServer())
        .get(`/orders/${newOrder._id}`)
        .set('Authorization', bearerToken)
        .expect(function ({ body }) {
          if (!body) throw new Error('Body is undefined');
          if (!body._id) throw new Error('id is undefined');
        })
        .expect(200);
    });

    it(`can create order`, () => {
      return request(app.getHttpServer())
        .post(`/orders`)
        .set('Authorization', bearerToken)
        .send({ ...ORDER_1, ownerId: regularUser._id })
        .expect(function ({ body }) {
          if (!body) throw new Error('Body is undefined');
        })
        .expect(201);
    });

    it(`can update order`, async () => {
      const newOrder = await orderModel.create({
        ...ORDER_1,
        ownerId: regularUser._id,
      });

      await request(app.getHttpServer())
        .put(`/orders/${newOrder._id}`)
        .set('Authorization', bearerToken)
        .send({ ...ORDER_1, ownerId: regularUser._id, category: '2' })
        .expect(function ({ body }) {
          if (!body) throw new Error('Body is undefined');
        })
        .expect(200);
    });

    it(`can delete order`, async () => {
      const newOrder = await orderModel.create({
        ...ORDER_1,
        ownerId: regularUser._id,
      });

      await request(app.getHttpServer())
        .delete(`/orders/${newOrder._id}`)
        .set('Authorization', bearerToken)
        .expect(200);

      const orders = await orderModel.find();
      expect(orders).toHaveLength(0);
    });

    it(`delete error: non-existing order`, () => {
      return request(app.getHttpServer())
        .delete(`/orders/111111111111111111111111`)
        .set('Authorization', bearerToken)
        .expect(404);
    });
  });

  describe('Role: user', () => {
    beforeAll(async () => {
      const user = {
        email: 'user@google.com',
        password: 'password',
        role: Role.User,
      };

      await userModel.create(user);
      const { body } = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: user.email, password: user.password });
      bearerToken = `Bearer ${body.access_token}`;
    });

    it(`get all error`, async () => {
      return request(app.getHttpServer())
        .get(`/orders`)
        .set('Authorization', bearerToken)
        .expect(403);
    });

    it(`get one error`, async () => {
      return request(app.getHttpServer())
        .get(`/orders/1`)
        .set('Authorization', bearerToken)
        .expect(403);
    });

    it(`create error`, () => {
      return request(app.getHttpServer())
        .post(`/orders`)
        .set('Authorization', bearerToken)
        .send({})
        .expect(403);
    });

    it(`update error`, () => {
      return request(app.getHttpServer())
        .put(`/orders/1`)
        .send({})
        .set('Authorization', bearerToken)
        .expect(403);
    });

    it(`delete error`, () => {
      return request(app.getHttpServer())
        .delete(`/orders/1`)
        .set('Authorization', bearerToken)
        .expect(403);
    });
  });
});
