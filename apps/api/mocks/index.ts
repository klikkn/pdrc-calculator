import { IOrder, Role } from '@pdrc/api-interfaces';
import { DEFAULT_USER_OPTIONS } from '../src/app/shared/consts';

export const ADMIN_DOCUMENT = {
  email: 'admin@google.com',
  password: 'admin',
  role: Role.Admin,
};

export const USER_DOCUMENT = {
  email: 'user1@google.com',
  password: 'user1',
  role: Role.User,
  options: DEFAULT_USER_OPTIONS,
};

export const ORDER_1: Omit<IOrder, 'ownerId'> = {
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
