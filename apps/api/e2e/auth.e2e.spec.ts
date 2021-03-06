import * as request from 'supertest';
import { Model } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { Role } from '@pdrc/api-interfaces';

import { AppModule } from '../src/app/app.module';
import { User, UserDocument } from '../src/app/modules/users/user.schema';

const user = {
  email: 'user1@google.com',
  password: 'password',
};

const userDocument = {
  email: 'user1@google.com',
  password: 'password',
  role: Role.User,
};

describe('Auth e2e', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let module: TestingModule;
  let userModel: Model<UserDocument>;

  beforeAll(async () => {
    mongod = new MongoMemoryServer();
    process.env.DB_URL = await mongod.getUri();

    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
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
    await userModel.create(userDocument);
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: user.email, password: user.password })
      .expect(function ({ body }) {
        if (!body) throw new Error('Body is undefined');
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
      })
      .expect(200, done);
  });

  it(`Register error if user already exist in database`, async () => {
    await userModel.create(userDocument);
    return request(app.getHttpServer())
      .post('/auth/register')
      .send(user)
      .expect(400);
  });

  it(`Successfull password reset`, async () => {
    const user = await userModel.create(userDocument);
    await request(app.getHttpServer())
      .post('/auth/reset-link')
      .send({ username: user.email })
      .expect(200);

    const userWithResetLink = await userModel.findById(user.id);
    const loginData = { username: user.email, password: 'new-password' };
    await request(app.getHttpServer())
      .post('/auth/password')
      .send({
        ...loginData,
        resetToken: userWithResetLink.resetToken,
      })
      .expect(200);

    return request(app.getHttpServer())
      .post('/auth/login')
      .send(loginData)
      .expect(200);
  });

  it(`Password reset error if incorrect reset link`, async () => {
    const user = await userModel.create(userDocument);
    await request(app.getHttpServer())
      .post('/auth/reset-link')
      .send({ username: user.email })
      .expect(200);

    const loginData = { username: user.email, password: 'new-password' };
    await request(app.getHttpServer())
      .post('/auth/password')
      .send({
        ...loginData,
        resetToken: 'aaaa',
      })
      .expect(400);

    return request(app.getHttpServer())
      .post('/auth/login')
      .send(loginData)
      .expect(401);
  });
});
