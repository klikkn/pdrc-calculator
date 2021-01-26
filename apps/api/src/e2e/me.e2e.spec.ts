import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { clone } from 'ramda';

import { Roles } from '@pdrc/api-interfaces';

import { User, UserDocument } from '../app/modules/users/user.schema';
import { Model } from 'mongoose';
import { AppModule } from '../app/app.module';
import { DEFAULT_USER_OPTIONS } from '../app/shared/consts';

const user = {
  email: 'user1@google.com',
  password: 'password',
  role: Roles.User,
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
        email: user.email,
        password: user.password,
      });

    bearerToken = `Bearer ${body.access_token}`;
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
});
