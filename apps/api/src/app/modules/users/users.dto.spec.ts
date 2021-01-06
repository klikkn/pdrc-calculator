import { ArgumentMetadata, ValidationPipe } from '@nestjs/common';
import { UserCreateRequestDto, UserUpdateRequestDto } from './users.dto';

describe('Users DTO', () => {
  const target: ValidationPipe = new ValidationPipe();

  const metadata: ArgumentMetadata = {
    type: 'body',
    metatype: UserCreateRequestDto,
    data: '',
  };

  describe('Create request data', () => {
    it.each<string>(['', 'user1', 'user1@google', 'user1@google.'])(
      'error with invalid email: %s',
      async (email: string) => {
        const data = { email, password: 'password' };
        await expect(target.transform(data, metadata)).rejects.toThrow();
      }
    );

    it.each<keyof UserCreateRequestDto>(['email', 'password'])(
      'error without %s',
      async (key: keyof UserCreateRequestDto) => {
        const data = { email: 'user1@google.ru', password: 'password' };
        delete data[key];
        await expect(target.transform(data, metadata)).rejects.toThrow();
      }
    );
  });

  describe('Update request data', () => {
    it.each<string>(['', 'user1', 'user1@google', 'user1@google.'])(
      'error with invalid email: %s',
      async (email: string) => {
        const data = { email, password: 'password' };
        await expect(target.transform(data, metadata)).rejects.toThrow();
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
      ).rejects.toThrow();
    });

    it.each<keyof UserUpdateRequestDto>(['email'])(
      'error without %s',
      async (key: keyof UserUpdateRequestDto) => {
        const data = { email: 'user1@google.ru' };
        delete data[key];
        await expect(target.transform(data, metadata)).rejects.toThrow();
      }
    );
  });
});
