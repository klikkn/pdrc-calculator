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
      count: 2,
      value: '1-2',
      part: 'left door',
      unitPrice: 1200,
    },
    {
      count: 1,
      value: '2-4',
      part: 'right door',
      unitPrice: 1200,
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
  });
});
