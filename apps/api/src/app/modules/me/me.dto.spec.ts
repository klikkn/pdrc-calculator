import {
  ArgumentMetadata,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';

import { IOrder, Roles } from '@pdrc/api-interfaces';
import { DEFAULT_USER_OPTIONS } from '../../shared/consts';
import {
  MeUpdateOrderRequestDto,
  MeUpdateRequestDto,
  MeCreateOrderRequestDto,
} from './me.dto';

const order: IOrder = {
  carModel: 'A5',
  carProducer: 'Audi',
  category: '1',
  clientName: 'Ivan',
  clientPhone: '89998887766',
  date: new Date(),
  items: [
    {
      column: 'A',
      count: 1,
      part: 'right door',
      row: '1-2',
      table: 'Complicated',
      value: 200,
    },
    {
      column: 'A',
      count: 1,
      part: 'right door',
      row: '1-2',
      table: 'Simple',
      value: 200,
    },
  ],
  ownerId: '1',
};

describe('Me DTO', () => {
  const target: ValidationPipe = new ValidationPipe();

  describe('Update personal data', () => {
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: MeUpdateRequestDto,
      data: '',
    };

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

  describe('Create order data', () => {
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: MeCreateOrderRequestDto,
      data: '',
    };

    it(`error with new ownerId`, async () => {
      await expect(target.transform(order, metadata)).rejects.toThrow();
    });
  });

  describe('Update order data', () => {
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: MeUpdateOrderRequestDto,
      data: '',
    };

    it(`error with new ownerId`, async () => {
      await expect(target.transform(order, metadata)).rejects.toThrow();
    });
  });
});
