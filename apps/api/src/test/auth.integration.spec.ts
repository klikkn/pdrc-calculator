import * as request from 'supertest';
import { Model } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { AuthModule } from '../app/modules/auth/auth.module';
import { UsersModule } from '../app/modules/users/users.module';
import { User, UserDocument } from '../app/modules/users/user.schema';

const user = {
  email: 'user1@google.com',
  password: 'password',
};

describe('Auth', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let module: TestingModule;
  let userModel: Model<UserDocument>;

  beforeAll(async () => {
    mongod = new MongoMemoryServer();
    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          useFactory: async () => ({ uri: await mongod.getUri() }),
        }),
        AuthModule,
        UsersModule,
      ],
    }).compile();

    app = module.createNestApplication();
    userModel = module.get(`${User.name}Model`);
    await app.init();
  });

  beforeEach(async () => {
    await userModel.deleteMany();
  });

  afterAll(async () => {
    await module.close();
    await mongod.stop();
  });

  it(`Successfull login by email`, async () => {
    await userModel.create(user);
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: user.email, password: user.password })
      .expect(function ({ body }) {
        if (!body) throw new Error('Body is undefined');
        if (body.access_token === undefined)
          throw new Error('Access token is undefined');
        if (body.user === undefined) throw new Error('User is undefined');
        if (body.user.email === undefined)
          throw new Error('User email is undefined');
        if (body.user.password !== undefined)
          throw new Error('User email has to be undefined');
      })
      .expect(200);
  });

  it(`Login error if user do not exist in database`, (done) => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'user1@google.com', password: 'password' })
      .expect(401, done);
  });

  it(`Successfull user register`, (done) => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send(user)
      .expect(function ({ body }) {
        if (!body) throw new Error('Body is undefined');
        if (body.access_token === undefined)
          throw new Error('Access token is undefined');
        if (body.user === undefined) throw new Error('User is undefined');
        if (body.user.email === undefined)
          throw new Error('User email is undefined');
        if (body.user.password !== undefined)
          throw new Error('User email has to be undefined');
      })
      .expect(200, done);
  });
});
