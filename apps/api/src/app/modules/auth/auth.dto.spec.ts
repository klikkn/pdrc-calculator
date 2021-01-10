import { ArgumentMetadata, ValidationPipe } from '@nestjs/common';
import { UserRegisterRequestDto } from './auth.dto';

describe('Auth DTO', () => {
  const target: ValidationPipe = new ValidationPipe();

  const metadata: ArgumentMetadata = {
    type: 'body',
    metatype: UserRegisterRequestDto,
    data: '',
  };

  describe('Register request data', () => {
    it.each<string>(['', 'user1', 'user1@google', 'user1@google.'])(
      'error with invalid email: %s',
      async (email: string) => {
        const data = { email, password: 'password' };
        await expect(target.transform(data, metadata)).rejects.toThrow();
      }
    );

    it.each<keyof UserRegisterRequestDto>(['email', 'password'])(
      'error without %s',
      async (key: keyof UserRegisterRequestDto) => {
        const data = { email: 'user1@google.ru', password: 'password' };
        delete data[key];
        await expect(target.transform(data, metadata)).rejects.toThrow();
      }
    );
  });
});
