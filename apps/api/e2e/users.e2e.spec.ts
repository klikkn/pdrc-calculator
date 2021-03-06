import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { clone } from 'ramda';

import { Role } from '@pdrc/api-interfaces';

import { User, UserDocument } from '../src/app/modules/users/user.schema';
import { Model } from 'mongoose';
import { AppModule } from '../src/app/app.module';
import { DEFAULT_USER_OPTIONS } from '../src/app/shared/consts';
import { USER_DOCUMENT } from '../mocks';

const USER = {
  email: USER_DOCUMENT.email,
  password: USER_DOCUMENT.password,
  role: USER_DOCUMENT.role,
};

const USER_DOCUMENT_TO_UPDATE = {
  email: USER_DOCUMENT.email,
  options: DEFAULT_USER_OPTIONS,
};

describe('Users CRUD e2e', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let module: TestingModule;
  let userModel: Model<UserDocument>;
  let bearerToken: string;

  beforeAll(async () => {
    mongod = new MongoMemoryServer();
    const uri = await mongod.getUri();

    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule.register({ uri })],
    }).compile();

    app = module.createNestApplication();
    userModel = module.get(`${User.name}Model`);
    await app.init();
  });

  afterAll(async () => {
    await module.close();
    await mongod.stop();
  });

  describe('Role: admin', () => {
    beforeAll(async () => {
      const user = {
        email: 'admin@google.com',
        password: 'password',
      };

      await userModel.create({ ...user, role: Role.Admin });
      const { body } = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: user.email, password: user.password });
      bearerToken = `Bearer ${body.access_token}`;
    });

    beforeEach(async () => {
      await userModel.findOneAndDelete({ email: USER_DOCUMENT.email });
    });

    it(`can get all users`, async () => {
      await userModel.create(USER_DOCUMENT);
      await request(app.getHttpServer())
        .get(`/users`)
        .set('Authorization', bearerToken)
        .expect(function ({ body }) {
          if (!body) throw new Error('Body is undefined');
          if (!body.length)
            throw new Error('Body should have at least one user');
        })
        .expect(200);
    });

    it(`can get one user`, async () => {
      const newUser = await userModel.create(USER_DOCUMENT);
      await request(app.getHttpServer())
        .get(`/users/${newUser._id}`)
        .set('Authorization', bearerToken)
        .expect(function ({ body }) {
          if (!body) throw new Error('Body is undefined');
          if (!body._id) throw new Error('id is undefined');
        })
        .expect(200);
    });

    it(`can create regular user`, async () => {
      return request(app.getHttpServer())
        .post(`/users`)
        .set('Authorization', bearerToken)
        .send(USER)
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

    it(`can create admin user`, async () => {
      return request(app.getHttpServer())
        .post(`/users`)
        .set('Authorization', bearerToken)
        .send({ ...USER, role: Role.Admin })
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

    it(`create error: user email should be uniq`, async () => {
      await userModel.create(USER_DOCUMENT);
      await request(app.getHttpServer())
        .post(`/users`)
        .set('Authorization', bearerToken)
        .send(USER)
        .expect(500);
    });

    it(`can update admin user email`, async () => {
      const newUser = await userModel.create({
        ...USER_DOCUMENT,
        role: Role.Admin,
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

    it(`can update regular user email`, async () => {
      const newUser = await userModel.create({
        ...USER_DOCUMENT,
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

    it(`can update regular user options`, async () => {
      const newOptions = {
        ...clone(DEFAULT_USER_OPTIONS),
        columns: ['AA', 'BB', 'CC'],
      };
      const newUser = await userModel.create({
        ...USER_DOCUMENT,
        options: DEFAULT_USER_OPTIONS,
      });

      await request(app.getHttpServer())
        .put(`/users/${newUser.id}`)
        .send({
          ...USER_DOCUMENT_TO_UPDATE,
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
      expect(updatedUser.email).toEqual(USER_DOCUMENT.email);
      expect(updatedUser.options).toEqual(newOptions);
    });

    it(`update error: email should be uniq`, async () => {
      await userModel.create(USER_DOCUMENT);
      const newUser = await userModel.create({
        ...USER_DOCUMENT,
        email: 'user2@gmail.com',
      });

      await request(app.getHttpServer())
        .put(`/users/${newUser.id}`)
        .set('Authorization', bearerToken)
        .send({ ...USER_DOCUMENT_TO_UPDATE })
        .expect(500);
    });

    it(`can remove any user`, async () => {
      const newUser = await userModel.create({
        ...USER_DOCUMENT,
        options: DEFAULT_USER_OPTIONS,
      });

      await request(app.getHttpServer())
        .delete(`/users/${newUser.id}`)
        .set('Authorization', bearerToken)
        .expect(200);

      const user = await userModel.findById(newUser._id);
      expect(user).toBeNull();
    });

    it(`delete error: non-existing user`, () => {
      return request(app.getHttpServer())
        .delete(`/users/111111111111111111111111`)
        .set('Authorization', bearerToken)
        .expect(404);
    });
  });

  describe('Role: user', () => {
    beforeAll(async () => {
      const user = {
        email: 'user@google.com',
        password: 'password',
      };

      await userModel.create({ ...user, role: Role.User });
      const { body } = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: user.email, password: user.password });
      bearerToken = `Bearer ${body.access_token}`;
    });

    it(`get all error`, async () => {
      return request(app.getHttpServer())
        .get(`/users`)
        .set('Authorization', bearerToken)
        .expect(403);
    });

    it(`get one error`, async () => {
      return request(app.getHttpServer())
        .get(`/users/1`)
        .set('Authorization', bearerToken)
        .expect(403);
    });

    it(`create error`, () => {
      return request(app.getHttpServer())
        .post(`/users`)
        .set('Authorization', bearerToken)
        .send(USER_DOCUMENT)
        .expect(403);
    });

    it(`update error`, () => {
      return request(app.getHttpServer())
        .put(`/users/1234`)
        .send({ email: 'email' })
        .set('Authorization', bearerToken)
        .expect(403);
    });

    it(`delete error`, () => {
      return request(app.getHttpServer())
        .delete(`/users/1111`)
        .set('Authorization', bearerToken)
        .expect(403);
    });
  });
});
