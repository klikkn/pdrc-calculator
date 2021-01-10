import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IPriceTable, IUser, IUserOptions } from '@pdrc/api-interfaces';

@Schema()
export class PriceTable implements IPriceTable {
  @Prop({ required: true })
  rows: string[];

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  values: number[][];
}

@Schema()
export class UserOptions implements IUserOptions {
  @Prop({ required: true })
  columns: string[];

  @Prop({ required: true })
  columnsTitle: string;

  @Prop({ required: true })
  rowsTitle: string;

  @Prop({ required: true })
  tables: PriceTable[];
}

@Schema()
export class User implements IUser {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  options?: UserOptions;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
