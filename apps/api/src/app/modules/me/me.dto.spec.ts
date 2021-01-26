import {
  ArgumentMetadata,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';

import { Roles } from '@pdrc/api-interfaces';
import { DEFAULT_USER_OPTIONS } from '../../shared/consts';
import { MeUpdateRequestDto } from './me.dto';

describe('Me DTO', () => {
  const target: ValidationPipe = new ValidationPipe();

  const metadata: ArgumentMetadata = {
    type: 'body',
    metatype: MeUpdateRequestDto,
    data: '',
  };

  describe('Update request data', () => {
    const user = {
      email: 'user1@google.ru',
      options: DEFAULT_USER_OPTIONS,
      password: 'new one',
    };

    it('success', async () => {
      await expect(target.transform(user, metadata)).toBeTruthy();
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

    it.each<keyof MeUpdateRequestDto>(['email', 'password', 'role', 'options'])(
      'success without optional param - %s',
      async (key: keyof MeUpdateRequestDto) => {
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
      const data = { ...user, role: Roles.User };
      await expect(target.transform(data, metadata)).rejects.toThrow(
        BadRequestException
      );
    });
  });
});
