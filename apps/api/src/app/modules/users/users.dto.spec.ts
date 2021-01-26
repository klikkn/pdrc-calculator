import {
  ArgumentMetadata,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';
import { clone } from 'ramda';

import { IUserOptions, Roles } from '@pdrc/api-interfaces';
import { DEFAULT_USER_OPTIONS } from '../../shared/consts';
import {
  PriceTableDto,
  UserCreateRequestDto,
  UserOptionsDto,
  UserUpdateRequestDto,
} from './users.dto';

describe('Users DTO', () => {
  const target: ValidationPipe = new ValidationPipe();

  describe('User options validation', () => {
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: UserOptionsDto,
      data: '',
    };

    let data: IUserOptions;

    beforeEach(() => {
      data = clone(DEFAULT_USER_OPTIONS);
    });

    it('success', async () => {
      await expect(
        target.transform(DEFAULT_USER_OPTIONS, metadata)
      ).toBeTruthy();
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

    it.each<keyof PriceTableDto>(['rows', 'title', 'values'])(
      'error without %s',
      async (key: keyof PriceTableDto) => {
        const table = { ...data.tables[0] };
        delete table[key];
        data.tables = [table];
        await expect(target.transform(data, metadata)).rejects.toThrow(
          BadRequestException
        );
      }
    );

    it('error with empty table title', async () => {
      data.tables[0].title = '';
      await expect(target.transform(data, metadata)).rejects.toThrow(
        BadRequestException
      );
    });

    it('error with incorrect table values count', async () => {
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

  describe('Create request data', () => {
    const user = {
      email: 'user1@google.ru',
      password: 'password',
      role: Roles.User,
    };

    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: UserCreateRequestDto,
      data: '',
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
        target.transform({ ...user, options: DEFAULT_USER_OPTIONS }, metadata)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Update request data', () => {
    const user = {
      email: 'user1@google.ru',
      options: DEFAULT_USER_OPTIONS,
    };

    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: UserUpdateRequestDto,
      data: '',
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

    it.each<keyof UserUpdateRequestDto>([
      'email',
      'password',
      'role',
      'options',
    ])(
      'success without optional param - %s',
      async (key: keyof UserUpdateRequestDto) => {
        const data = { ...user };
        delete data[key];
        await expect(target.transform(data, metadata)).toBeTruthy();
      }
    );

    it('error with _id', async () => {
      await expect(
        target.transform({ _id: '222' }, metadata)
      ).rejects.toThrow();
    });

    it('error with new role', async () => {
      await expect(
        target.transform({ user, role: Roles.User }, metadata)
      ).rejects.toThrow(BadRequestException);
    });
  });
});
