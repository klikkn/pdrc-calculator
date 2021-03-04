import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { clone } from 'ramda';

import { Role } from '@pdrc/api-interfaces';

import { MOCK_ORDER } from './mocks';
import { User, UserDocument } from '../app/modules/users/user.schema';
import { Model } from 'mongoose';
import { AppModule } from '../app/app.module';
import { DEFAULT_USER_OPTIONS } from '../app/shared/consts';
import { Order, OrderDocument } from '../app/modules/orders/order.schema';

const user = {
  email: 'user1@google.com',
  password: 'password',
  role: Role.User,
  options: DEFAULT_USER_OPTIONS,
};

const userToUpdate = {
  ...user,
  role: undefined,
};

describe('Me e2e', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let module: TestingModule;
  let userModel: Model<UserDocument>;
  let orderModel: Model<OrderDocument>;
  let loggedUser: UserDocument;
  let bearerToken: string;

  beforeAll(async () => {
    mongod = new MongoMemoryServer();
    process.env.DB_URL = await mongod.getUri();

    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    userModel = module.get(`${User.name}Model`);
    orderModel = module.get(`${Order.name}Model`);
    await app.init();

    loggedUser = await userModel.create({ ...user, role: Role.Admin });
    const { body } = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: user.email, password: user.password });
    bearerToken = `Bearer ${body.access_token}`;
  });

  beforeEach(async () => {
    await orderModel.deleteMany();
  });

  afterAll(async () => {
    await module.close();
    await mongod.stop();
  });

  it(`email successfull update`, async () => {
    const newEmail = 'user2@google.com';
    await request(app.getHttpServer())
      .put(`/me`)
      .send({ email: newEmail })
      .set('Authorization', bearerToken)
      .expect(({ body }) => {
        if (Object.keys(body).length) {
          console.log(body);
          throw new Error('Body should be empty');
        }
      })
      .expect(200);

    const users = await userModel.find();
    expect(users[0].email).toEqual(newEmail);
    expect(users[0].options).toEqual(DEFAULT_USER_OPTIONS);
  });

  it(`options successfull update`, async () => {
    const newOptions = {
      ...clone(DEFAULT_USER_OPTIONS),
      columns: ['AA', 'BB', 'CC'],
    };

    await request(app.getHttpServer())
      .put(`/me`)
      .send({
        ...userToUpdate,
        options: newOptions,
      })
      .set('Authorization', bearerToken)
      .expect(({ body }) => {
        if (Object.keys(body).length) {
          console.log(body);
          throw new Error('Body should be empty');
        }
      })
      .expect(200);

    const users = await userModel.find();
    expect(users[0].email).toEqual(user.email);
    expect(users[0].options).toEqual(newOptions);
  });

  it(`Update error: email should be uniq`, async () => {
    const newUser = {
      ...user,
      email: 'user2@google.com',
    };
    await userModel.create(newUser);

    await request(app.getHttpServer())
      .put(`/me`)
      .set('Authorization', bearerToken)
      .send({ ...userToUpdate, email: newUser.email })
      .expect(500);
  });

  it(`can get only own orders`, async () => {
    await orderModel.create({ ...MOCK_ORDER, ownerId: loggedUser._id });
    await orderModel.create({ ...MOCK_ORDER, ownerId: '1' });

    await request(app.getHttpServer())
      .get(`/me/orders`)
      .set('Authorization', bearerToken)
      .expect(function ({ body }) {
        if (!body) throw new Error('Body is undefined');
        if (body.length > 1) throw new Error('Body should have one order');
      })
      .expect(200);
  });

  it(`can get one own order`, async () => {
    const newOrder = await orderModel.create({
      ...MOCK_ORDER,
      ownerId: loggedUser._id,
    });

    await request(app.getHttpServer())
      .get(`/me/orders/${newOrder._id}`)
      .set('Authorization', bearerToken)
      .expect(function ({ body }) {
        if (!body) throw new Error('Body is undefined');
        if (!body._id) throw new Error('id is undefined');
      })
      .expect(200);
  });

  it(`cannot get one another's order`, async () => {
    const newOrder = await orderModel.create({ ...MOCK_ORDER, ownerId: '1' });
    await request(app.getHttpServer())
      .get(`/me/orders/${newOrder._id}`)
      .set('Authorization', bearerToken)
      .expect(404);
  });

  it(`can create order`, () => {
    return request(app.getHttpServer())
      .post(`/me/orders`)
      .set('Authorization', bearerToken)
      .send({ ...MOCK_ORDER })
      .expect(function ({ body }) {
        if (!body) throw new Error('Body is undefined');
        if (body.ownerId) throw new Error('Order should not contain ownerId');
      })
      .expect(201);
  });

  it(`can update own order`, async () => {
    const newOrder = await orderModel.create({
      ...MOCK_ORDER,
      ownerId: loggedUser._id,
    });

    await request(app.getHttpServer())
      .put(`/me/orders/${newOrder._id}`)
      .set('Authorization', bearerToken)
      .send({ ...MOCK_ORDER })
      .expect(function ({ body }) {
        if (!body) throw new Error('Body is undefined');
      })
      .expect(200);
  });

  it(`cannot update another's order`, async () => {
    const newOrder = await orderModel.create({ ...MOCK_ORDER, ownerId: '1' });
    await request(app.getHttpServer())
      .put(`/me/orders/${newOrder._id}`)
      .set('Authorization', bearerToken)
      .send({ ...MOCK_ORDER })
      .expect(404);
  });

  it(`can delete own order`, async () => {
    const newOrder = await orderModel.create({
      ...MOCK_ORDER,
      ownerId: loggedUser._id,
    });

    await request(app.getHttpServer())
      .delete(`/me/orders/${newOrder._id}`)
      .set('Authorization', bearerToken)
      .expect(200);

    const orders = await orderModel.find();
    expect(orders).toHaveLength(0);
  });

  it(`cannot delete another's order`, async () => {
    const newOrder = await orderModel.create({ ...MOCK_ORDER, ownerId: '1' });
    await request(app.getHttpServer())
      .delete(`/me/orders/${newOrder._id}`)
      .set('Authorization', bearerToken)
      .expect(404);
  });

  it(`delete error: non-existing order`, () => {
    return request(app.getHttpServer())
      .delete(`/me/orders/111111111111111111111111`)
      .set('Authorization', bearerToken)
      .expect(404);
  });
});
