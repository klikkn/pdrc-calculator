export interface Message {
  message: string;
}

export interface IUser {
  email: string;
  // options: IUserOptions;
  password: string;
}

export interface IUserOptions {
  parts: string[];
  tables: IPriceTable[];
}

export interface IPriceTable {
  columns: string[];
  columnsTitle: string;
  rows: string[];
  rowsTitle: string;
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
  count: number;
  value: string;
  part: string;
  unitPrice: number;
}
