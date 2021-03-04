import { CarClass, Part, Role, Size } from './api-types';

export interface Message {
  message: string;
}

export interface ILogin {
  username: string;
  password: string;
}

export interface IUser {
  email: string;
  options?: IUserOptions;
  password: string;
  role: Role;
}

export interface IUserOptions {
  classes: CarClass[];
  columns: number[];
  parts: Part[];
  sizes: Size[];
  tables: IPriceTable[];
}

export interface IPriceTable {
  rows: number[];
  title: string;
  values: number[][];
}

export interface IOrder {
  carModel: string;
  carProducer: string;
  category: string;
  clientName: string;
  clientPhone: string;
  date: Date;
  items: IOrderItem[];
  ownerId: string;
}

export interface IOrderItem {
  carClass: string;
  count: number;
  part: string;
  size: string;
  table: string;
  price: number;
}
