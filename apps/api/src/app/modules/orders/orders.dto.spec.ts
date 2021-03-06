import { ArgumentMetadata, ValidationPipe } from '@nestjs/common';
import { ORDER_1 } from '../../../../mocks';
import { OrderCreateRequestDto, OrderUpdateRequestDto } from './orders.dto';

describe('Orders DTO', () => {
  const target: ValidationPipe = new ValidationPipe();

  describe('Create request data', () => {
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: OrderCreateRequestDto,
      data: '',
    };

    it.each<keyof OrderCreateRequestDto>([
      'category',
      'date',
      'items',
      'ownerId',
    ])('error without %s', async (key: keyof OrderCreateRequestDto) => {
      const data = { ...ORDER_1 };
      delete data[key];
      await expect(target.transform(data, metadata)).rejects.toThrow();
    });

    it(`error with empty items`, async () => {
      const data = { ...ORDER_1 };
      data.items = [];

      await expect(target.transform(data, metadata)).rejects.toThrow();
    });
  });

  describe('Update request data', () => {
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: OrderUpdateRequestDto,
      data: '',
    };

    it.each<keyof OrderUpdateRequestDto>([
      'category',
      'date',
      'items',
      'ownerId',
    ])('error without %s', async (key: keyof OrderUpdateRequestDto) => {
      const data = { ...ORDER_1 };
      delete data[key];
      await expect(target.transform(data, metadata)).rejects.toThrow();
    });

    it(`error with empty items`, async () => {
      const data = { ...ORDER_1 };
      data.items = [];

      await expect(target.transform(data, metadata)).rejects.toThrow();
    });

    it(`error with wrong item, missed property`, async () => {
      const data = { ...ORDER_1 };
      data.items = [{ count: 1, value: 2, part: 3 } as any];
      await expect(target.transform(data, metadata)).rejects.toThrow();
    });

    it(`error with wrong item, no properties`, async () => {
      const data = { ...ORDER_1 };
      data.items = [{} as any];
      await expect(target.transform(data, metadata)).rejects.toThrow();
    });
  });
});
