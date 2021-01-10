import { ArgumentMetadata, ValidationPipe } from '@nestjs/common';
import { IOrder } from '@pdrc/api-interfaces';
import { OrderCreateRequestDto, OrderUpdateRequestDto } from './orders.dto';

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
      const data = { ...order };
      delete data[key];
      await expect(target.transform(data, metadata)).rejects.toThrow();
    });

    it(`error with empty items`, async () => {
      const data = { ...order };
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
      const data = { ...order };
      delete data[key];
      await expect(target.transform(data, metadata)).rejects.toThrow();
    });

    it(`error with empty items`, async () => {
      const data = { ...order };
      data.items = [];

      await expect(target.transform(data, metadata)).rejects.toThrow();
    });

    it(`error with wrong item, missed property`, async () => {
      const data = { ...order };
      data.items = [{ count: 1, value: 2, part: 3 } as any];
      await expect(target.transform(data, metadata)).rejects.toThrow();
    });

    it(`error with wrong item, no properties`, async () => {
      const data = { ...order };
      data.items = [{} as any];
      await expect(target.transform(data, metadata)).rejects.toThrow();
    });
  });
});
