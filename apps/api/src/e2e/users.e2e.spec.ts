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

const testUser = {
  email: 'user1@gmail.com',
  password: 'password',
  role: Roles.User,
};

const testUserToUpdate = {
  email: testUser.email,
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
    process.env.DB_URL = await mongod.getUri();

    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
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

      await userModel.create({ ...user, role: Roles.Admin });
      const { body } = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: user.email, password: user.password });
      bearerToken = `Bearer ${body.access_token}`;
    });

    beforeEach(async () => {
      await userModel.findOneAndDelete({ email: testUser.email });
    });

    it(`can get all users`, async () => {
      await userModel.create(testUser);
      await request(app.getHttpServer())
        .get(`/orders`)
        .set('Authorization', bearerToken)
        .expect(function ({ body }) {
          if (!body) throw new Error('Body is undefined');
          if (!body.length) throw new Error('Body should have one order');
        })
        .expect(200);
    });

    it(`can get one user`, async () => {
      const newUser = await userModel.create(testUser);
      await request(app.getHttpServer())
        .get(`/orders/${newUser._id}`)
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
        .send(testUser)
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
        .send({ ...testUser, role: Roles.Admin })
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
      await userModel.create(testUser);
      await request(app.getHttpServer())
        .post(`/users`)
        .set('Authorization', bearerToken)
        .send(testUser)
        .expect(500);
    });

    it(`can update admin user email`, async () => {
      const newUser = await userModel.create({
        ...testUser,
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

    it(`can update regular user email`, async () => {
      const newUser = await userModel.create({
        ...testUser,
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
        ...testUser,
        options: DEFAULT_USER_OPTIONS,
      });

      await request(app.getHttpServer())
        .put(`/users/${newUser.id}`)
        .send({
          ...testUserToUpdate,
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
      expect(updatedUser.email).toEqual(testUser.email);
      expect(updatedUser.options).toEqual(newOptions);
    });

    it(`update error: email should be uniq`, async () => {
      await userModel.create(testUser);
      const newUser = await userModel.create({
        ...testUser,
        email: 'user2@gmail.com',
      });

      await request(app.getHttpServer())
        .put(`/users/${newUser.id}`)
        .set('Authorization', bearerToken)
        .send({ ...testUserToUpdate })
        .expect(500);
    });

    it(`can remove any user`, async () => {
      const newUser = await userModel.create({
        ...testUser,
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

      await userModel.create({ ...user, role: Roles.User });
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
        .send(testUser)
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
