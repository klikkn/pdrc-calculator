import {
  ArgumentMetadata,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';
import { clone } from 'ramda';

import { IUserOptions, Roles } from '@pdrc/api-interfaces';
import { defaultUserOptions } from '../../shared/consts';
import {
  UserCreateRequestDto,
  UserUpdateRequestDto,
  UserOptionsDto,
} from './users.dto';

describe('Users DTO', () => {
  const target: ValidationPipe = new ValidationPipe();

  const metadata: ArgumentMetadata = {
    type: 'body',
    metatype: UserCreateRequestDto,
    data: '',
  };

  describe('Create request data', () => {
    const user = {
      email: 'user1@google.ru',
      password: 'password',
      role: Roles.User,
    };

    it('success with role user', async () => {
      await expect(target.transform(user, metadata)).toBeTruthy();
    });

    it('success with role admin', async () => {
      await expect(
        target.transform({ ...user, role: Roles.Admin }, metadata)
      ).toBeTruthy();
    });

    it.each<string>(['', 'user1', 'user1@google', 'user1@google.'])(
      'error with invalid email: %s',
      async (email: string) => {
        const data = { ...user, email };
        await expect(target.transform(data, metadata)).rejects.toThrow(
          BadRequestException
        );
      }
    );

    it.each<keyof UserCreateRequestDto>(['email', 'password', 'role'])(
      'error without %s',
      async (key: keyof UserCreateRequestDto) => {
        const data = { ...user };
        delete data[key];
        await expect(target.transform(data, metadata)).rejects.toThrow(
          BadRequestException
        );
      }
    );

    it('error with options', async () => {
      await expect(
        target.transform({ ...user, options: defaultUserOptions }, metadata)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Update request data', () => {
    const user = {
      email: 'user1@google.ru',
      options: defaultUserOptions,
    };

    it.each<string>(['', 'user1', 'user1@google', 'user1@google.'])(
      'error with invalid email: %s',
      async (email: string) => {
        const data = { ...user, email };
        await expect(target.transform(data, metadata)).rejects.toThrow(
          BadRequestException
        );
      }
    );

    it('error with _id', async () => {
      await expect(
        target.transform({ _id: '222' }, metadata)
      ).rejects.toThrow();
    });

    it('error with new password', async () => {
      await expect(
        target.transform({ password: 'password' }, metadata)
      ).rejects.toThrow(BadRequestException);
    });

    it('error with new role', async () => {
      await expect(
        target.transform({ user, role: Roles.User }, metadata)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('User options validation', () => {
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: UserOptionsDto,
      data: '',
    };

    let data: IUserOptions;

    beforeEach(() => {
      data = clone(defaultUserOptions);
    });

    it('success', async () => {
      await expect(target.transform(defaultUserOptions, metadata)).toBeTruthy();
    });

    it.each<keyof UserOptionsDto>([
      'columns',
      'columnsTitle',
      'rowsTitle',
      'tables',
    ])('error without %s', async (key: keyof UserOptionsDto) => {
      const copy = { ...data };
      delete data[key];
      await expect(target.transform(copy, metadata)).rejects.toThrow(
        BadRequestException
      );
    });

    it('error with table without title', async () => {
      data.tables = undefined;
      await expect(target.transform(data, metadata)).rejects.toThrow(
        BadRequestException
      );
    });

    it('error with empty columns', async () => {
      data.columns = undefined;
      await expect(target.transform(data, metadata)).rejects.toThrow(TypeError);
    });

    it('error with empty table rows', async () => {
      data.tables[0].rows = undefined;
      await expect(target.transform(data, metadata)).rejects.toThrow(TypeError);
    });

    it('error with incorrect table values number', async () => {
      data.tables[0].values = [
        [1, 2],
        [1, 2, 3],
        [4, 5, 6],
      ];
      await expect(target.transform(data, metadata)).rejects.toThrow(
        BadRequestException
      );
    });

    it('error with empty options', async () => {
      data = {} as any;
      await expect(target.transform(data, metadata)).rejects.toThrow(
        BadRequestException
      );
    });
  });
});