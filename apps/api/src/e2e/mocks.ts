import { IOrder } from '@pdrc/api-interfaces';

export const MOCK_ORDER: Omit<IOrder, 'ownerId'> = {
  carModel: 'A5',
  carProducer: 'Audi',
  category: '1',
  clientName: 'Ivan',
  clientPhone: '89998887766',
  date: new Date(),
  items: [
    {
      carClass: 'A',
      count: 1,
      part: 'right door',
      size: '1-2',
      table: 'Complicated',
      price: 200,
    },
    {
      carClass: 'A',
      count: 1,
      part: 'right door',
      size: '1-2',
      table: 'Simple',
      price: 200,
    },
  ],
};
