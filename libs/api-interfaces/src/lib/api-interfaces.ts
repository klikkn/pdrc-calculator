import { Role } from './api-types';

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
  columns: string[];
  columnsTitle: string;
  rowsTitle: string;
  tables: IPriceTable[];
}

export interface IPriceTable {
  rows: string[];
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
  column: string;
  count: number;
  part: string;
  row: string;
  table: string;
  value: number;
}
