import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { User, UserDocument } from '../app/modules/users/user.schema';
import { Model } from 'mongoose';
import { AppModule } from '../app/app.module';

const user = {
  email: 'user1@google.com',
  password: 'password',
};

describe('Users e2e', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let module: TestingModule;
  let userModel: Model<UserDocument>;
  let bearerToken: string;

  beforeAll(async () => {
    mongod = new MongoMemoryServer();
    process.env.DB_URL = await mongod.getUri();

    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    userModel = module.get(`${User.name}Model`);
    await app.init();

    const { body } = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'user11@google.com',
        password: 'password',
      });
    bearerToken = `Bearer ${body.access_token}`;
  });

  beforeEach(async () => {
    await userModel.findOneAndDelete({ email: user.email });
  });

  afterAll(async () => {
    await module.close();
    await mongod.stop();
  });

  it(`Create successfull`, async () => {
    return request(app.getHttpServer())
      .post(`/users`)
      .set('Authorization', bearerToken)
      .send(user)
      .expect(function ({ body }) {
        if (!body) throw new Error('Body is undefined');
        if (body === undefined) throw new Error('User is undefined');
        if (body.email === undefined)
          throw new Error('User email is undefined');
        if (body.password !== undefined)
          throw new Error('User password should be undefined');
      })
      .expect(201);
  });

  it(`Create error: email should be uniq`, async () => {
    await userModel.create(user);
    await request(app.getHttpServer())
      .post(`/users`)
      .set('Authorization', bearerToken)
      .send(user)
      .expect(500);
  });

  it(`Update successfull`, async () => {
    const newUser = await userModel.create(user);
    await request(app.getHttpServer())
      .put(`/users/${newUser.id}`)
      .send({ email: 'user2@google.com' })
      .set('Authorization', bearerToken)
      .expect(({ body }) => {
        if (Object.keys(body).length) throw new Error('Body should be empty');
      })
      .expect(200);
  });

  it(`Update error: email should be uniq`, async () => {
    await userModel.create(user);
    const newUser2 = await userModel.create({
      ...user,
      email: 'user2@gmail.com',
    });

    await request(app.getHttpServer())
      .put(`/users/${newUser2.id}`)
      .set('Authorization', bearerToken)
      .send({ email: user.email })
      .expect(500);
  });

  it(`Delete error: non-existing user`, async () => {
    await request(app.getHttpServer())
      .delete(`/users/111111111111111111111111`)
      .set('Authorization', bearerToken)
      .expect(404);
  });
});
