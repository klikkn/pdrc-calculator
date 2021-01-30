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
};
