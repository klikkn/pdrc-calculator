import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.schema';
import { HttpException } from '@nestjs/common';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtService } from '@nestjs/jwt';

class AuthServiceMock {
  login(user) {
    return { user, access_token: 'token' };
  }
  register(user) {
    return this.login(user);
  }
}

class UsersServiceMock {
  create(data) {
    return { ...data, _id: 1 };
  }
}

class JwtServiceMock {
  sign() {
    return 'token';
  }
  verify() {
    return jest.fn(() => true);
  }
}

describe('AuthController', () => {
  let app: TestingModule;
  let authController: AuthController;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        LocalStrategy,
        { provide: AuthService, useClass: AuthServiceMock },
        { provide: UsersService, useClass: UsersServiceMock },
        { provide: JwtService, useClass: JwtServiceMock },
      ],
    }).compile();

    authController = app.get<AuthController>(AuthController);
  });

  describe('register', () => {
    it('success with correct data', async () => {
      const response = await authController.register({
        email: 'user1@google.ru',
        password: 'password',
      });

      expect(response.access_token).toBeDefined();
      expect(response.user).toBeDefined();
      expect(response.user.password).toBeUndefined();
    });

    it.each<string>(['', 'user1', 'user1@google', 'user1@google.'])(
      'error with invalid email: %s',
      async (email: string) => {
        const data = { email, password: 'password' };
        await expect(authController.register(data)).rejects.toThrow(
          HttpException
        );
      }
    );

    it.each<keyof User>(['email', 'password'])(
      'error without %s',
      async (key: keyof User) => {
        const data = { email: 'user1@google.ru', password: 'password' };
        delete data[key];
        await expect(authController.register(data)).rejects.toThrow(
          HttpException
        );
      }
    );
  });

  describe('login', () => {
    it('success with correct data', async () => {
      const response = await authController.login({
        email: 'user1@gmail.com',
        password: 'password',
      });

      expect(response.access_token).toBeDefined();
      expect(response.user).toBeDefined();
      expect(response.user.password).toBeUndefined();
    });
  });
});
