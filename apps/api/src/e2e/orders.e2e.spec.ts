import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model } from 'mongoose';

import { IOrder, Roles } from '@pdrc/api-interfaces';

import { AppModule } from '../app/app.module';
import { Order, OrderDocument } from '../app/modules/orders/order.schema';
import { User, UserDocument } from '../app/modules/users/user.schema';

const user = {
  email: 'user1@google.com',
  password: 'password',
  role: Roles.User,
};

const order: Omit<IOrder, 'ownerId'> = {
  carModel: 'A5',
  carProducer: 'Audi',
  category: '1',
  clientName: 'Ivan',
  clientPhone: '89998887766',
  date: new Date(),
  items: [
    {
      column: 'A',
      count: 1,
      part: 'right door',
      row: '1-2',
      table: 'Complicated',
      value: 200,
    },
    {
      column: 'A',
      count: 1,
      part: 'right door',
      row: '1-2',
      table: 'Simple',
      value: 200,
    },
  ],
};

describe('Orders e2e', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let module: TestingModule;
  let orderModel: Model<OrderDocument>;
  let userModel: Model<UserDocument>;
  let ownerId: string;
  let bearerToken: string;

  beforeAll(async () => {
    mongod = new MongoMemoryServer();
    process.env.DB_URL = await mongod.getUri();

    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    orderModel = module.get(`${Order.name}Model`);
    userModel = module.get(`${User.name}Model`);
    await app.init();

    ownerId = (await userModel.create(user))._id;
    const { body } = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'user11@google.com',
        password: 'password',
      });

    bearerToken = `Bearer ${body.access_token}`;
  });

  beforeEach(async () => {
    await orderModel.deleteMany();
  });

  afterAll(async () => {
    await module.close();
    await mongod.stop();
  });

  it(`Order get many successfull`, async () => {
    await orderModel.create({ ...order, ownerId });

    return request(app.getHttpServer())
      .get(`/orders`)
      .set('Authorization', bearerToken)
      .send({ ...order, ownerId })
      .expect(function ({ body }) {
        if (!body) throw new Error('Body is undefined');
        if (!body.length) throw new Error('Body should have one order');
      })
      .expect(200);
  });

  it(`Order get one successfull`, async () => {
    const newOrder = await orderModel.create({ ...order, ownerId });

    return request(app.getHttpServer())
      .get(`/orders/${newOrder._id}`)
      .set('Authorization', bearerToken)
      .send({ ...order, ownerId })
      .expect(function ({ body }) {
        if (!body) throw new Error('Body is undefined');
        if (!body._id) throw new Error('id is undefined');
      })
      .expect(200);
  });

  it(`Order create successfull`, async () => {
    return request(app.getHttpServer())
      .post(`/orders`)
      .set('Authorization', bearerToken)
      .send({ ...order, ownerId })
      .expect(function ({ body }) {
        if (!body) throw new Error('Body is undefined');
      })
      .expect(201);
  });

  it(`Order update successfull`, async () => {
    const newOrder = await orderModel.create({ ...order, ownerId });

    return request(app.getHttpServer())
      .put(`/orders/${newOrder._id}`)
      .set('Authorization', bearerToken)
      .send({ ...order, ownerId, category: '2' })
      .expect(function ({ body }) {
        if (!body) throw new Error('Body is undefined');
      })
      .expect(200);
  });

  it(`Delete success`, async () => {
    const newOrder = await orderModel.create({ ...order, ownerId });

    await request(app.getHttpServer())
      .delete(`/orders/${newOrder._id}`)
      .set('Authorization', bearerToken)
      .expect(200);

    const orders = await orderModel.find();
    expect(orders).toHaveLength(0);
  });

  it(`Delete error: non-existing order`, async () => {
    await request(app.getHttpServer())
      .delete(`/orders/111111111111111111111111`)
      .set('Authorization', bearerToken)
      .expect(404);
  });
});
