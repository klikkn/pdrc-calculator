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
const admin = { ...user, role: Roles.Admin };
const userToUpdate = { email: user.email, options: DEFAULT_USER_OPTIONS };

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

  it(`User create successfull`, async () => {
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
        if (body.options === undefined)
          throw new Error('User should have default options');
      })
      .expect(201);
  });

  it(`Admin create successfull`, async () => {
    return request(app.getHttpServer())
      .post(`/users`)
      .set('Authorization', bearerToken)
      .send(admin)
      .expect(function ({ body }) {
        if (!body) throw new Error('Body is undefined');
        if (body === undefined) throw new Error('User is undefined');
        if (body.email === undefined)
          throw new Error('User email is undefined');
        if (body.password !== undefined)
          throw new Error('User password should be undefined');
        if (body.options !== undefined)
          throw new Error('Admin should not have default options');
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

  it(`admin email successfull update`, async () => {
    const newUser = await userModel.create({
      ...user,
      email: 'admin@google.com',
      role: Roles.Admin,
    });
    const newEmail = 'admin2@google.com';
    await request(app.getHttpServer())
      .put(`/users/${newUser.id}`)
      .send({ email: newEmail })
      .set('Authorization', bearerToken)
      .expect(({ body }) => {
        if (Object.keys(body).length) {
          console.log(body);
          throw new Error('Body should be empty');
        }
      })
      .expect(200);

    const updatedUser = await userModel.findById(newUser._id);
    expect(updatedUser.email).toEqual(newEmail);
  });

  it(`user email successfull update`, async () => {
    const newUser = await userModel.create({
      ...user,
      options: DEFAULT_USER_OPTIONS,
    });
    const newEmail = 'user2@google.com';
    await request(app.getHttpServer())
      .put(`/users/${newUser.id}`)
      .send({ email: newEmail })
      .set('Authorization', bearerToken)
      .expect(({ body }) => {
        if (Object.keys(body).length) {
          console.log(body);
          throw new Error('Body should be empty');
        }
      })
      .expect(200);

    const updatedUser = await userModel.findById(newUser._id);
    expect(updatedUser.email).toEqual(newEmail);
    expect(updatedUser.options).toEqual(DEFAULT_USER_OPTIONS);
  });

  it(`user options successfull update`, async () => {
    const newOptions = {
      ...clone(DEFAULT_USER_OPTIONS),
      columns: ['AA', 'BB', 'CC'],
    };
    const newUser = await userModel.create({
      ...user,
      options: DEFAULT_USER_OPTIONS,
    });

    await request(app.getHttpServer())
      .put(`/users/${newUser.id}`)
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

    const updatedUser = await userModel.findById(newUser._id);
    expect(updatedUser.email).toEqual(user.email);
    expect(updatedUser.options).toEqual(newOptions);
  });

  it(`Update error: email should be uniq`, async () => {
    await userModel.create(user);
    const newUser = await userModel.create({
      ...user,
      email: 'user2@gmail.com',
    });

    await request(app.getHttpServer())
      .put(`/users/${newUser.id}`)
      .set('Authorization', bearerToken)
      .send({ ...userToUpdate })
      .expect(500);
  });

  it(`Delete error: non-existing user`, async () => {
    await request(app.getHttpServer())
      .delete(`/users/111111111111111111111111`)
      .set('Authorization', bearerToken)
      .expect(404);
  });
});
