import {
  ArgumentMetadata,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';
import { Roles } from '@pdrc/api-interfaces';
import { UserRegisterRequestDto } from './auth.dto';

describe('Auth DTO', () => {
  const target: ValidationPipe = new ValidationPipe();

  const metadata: ArgumentMetadata = {
    type: 'body',
    metatype: UserRegisterRequestDto,
    data: '',
  };

  const user = {
    email: 'user1@google.ru',
    password: 'password',
  };

  describe('Register request data', () => {
    it('success with email and password', async () => {
      await expect(target.transform(user, metadata)).toBeTruthy();
    });

    it.each<keyof UserRegisterRequestDto>(['email', 'password'])(
      'error without %s',
      async (key: keyof UserRegisterRequestDto) => {
        const data = { ...user };
        delete data[key];
        await expect(target.transform(data, metadata)).rejects.toThrow(
          BadRequestException
        );
      }
    );

    it.each<string>(['', 'user1', 'user1@google', 'user1@google.'])(
      'error with invalid email: %s',
      async (email: string) => {
        const data = { ...user, email };
        await expect(target.transform(data, metadata)).rejects.toThrow(
          BadRequestException
        );
      }
    );

    it('error with options', async () => {
      await expect(
        target.transform({ ...user, options: {} }, metadata)
      ).rejects.toThrow(BadRequestException);
    });

    it('error with role', async () => {
      await expect(
        target.transform({ ...user, role: Roles.User }, metadata)
      ).rejects.toThrow(BadRequestException);

      await expect(
        target.transform({ ...user, role: Roles.Admin }, metadata)
      ).rejects.toThrow(BadRequestException);
    });
  });
});
