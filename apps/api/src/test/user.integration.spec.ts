import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { UsersModule } from '../app/modules/users/users.module';
import { User, UserDocument } from '../app/modules/users/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Model } from 'mongoose';

const user = {
  email: 'user1@google.com',
  password: 'password',
};

describe('User CRUD', () => {
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

  it(`read`, async () => {
    await userModel.create(user);
    return request(app.getHttpServer())
      .get('/users')
      .expect(200)
      .expect((res) => {
        expect(JSON.parse(res.text)).toHaveLength(1);
      });
  });

  it(`Create success`, async () => {
    await request(app.getHttpServer())
      .post('/users')
      .send(user)
      .expect(function ({ body }) {
        if (!body) throw new Error('Body is undefined');
        if (body._id === undefined) throw new Error('Id is undefined');
        if (body.password === user.password)
          throw new Error('password was not hashed');
      })
      .expect(201);
  });

  it(`Create error: email and phone should be uniq`, async () => {
    await userModel.create(user);
    await request(app.getHttpServer()).post('/users').send(user).expect(500);
  });

  it(`Update success`, async () => {
    const newUser = await userModel.create(user);

    await request(app.getHttpServer())
      .put(`/users/${newUser.id}`)
      .send({ email: 'newUser@google.com' })
      .expect(200);

    const users = await userModel.find();

    expect(users[0].email).toBe('newUser@google.com');
    expect(users[0].password).toBeUndefined();
  });

  it(`Update error: email should be uniq`, async () => {
    await userModel.create(user);
    const newUser2 = await userModel.create({
      ...user,
      email: 'user2@gmail.com',
    });

    await request(app.getHttpServer())
      .put(`/users/${newUser2.id}`)
      .send({ email: user.email })
      .expect(500);
  });

  it(`Delete success`, async () => {
    const newUser = await userModel.create(user);
    const usersBefore = await userModel.find();
    expect(usersBefore).toHaveLength(1);

    await request(app.getHttpServer())
      .delete(`/users/${newUser._id}`)
      .expect(200);

    const usersAfter = await userModel.find();
    expect(usersAfter).toHaveLength(0);
  });

  it(`Delete error: non-existing user`, async () => {
    await request(app.getHttpServer())
      .delete(`/users/111111111111111111111111`)
      .expect(404);
  });
});
