import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  CarClass,
  IPriceTable,
  IUser,
  IUserOptions,
  Part,
  Role,
  Size,
} from '@pdrc/api-interfaces';

@Schema()
export class PriceTable implements IPriceTable {
  @Prop({ required: true })
  rows: number[];

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  values: number[][];
}

@Schema()
export class UserOptions implements IUserOptions {
  @Prop({ required: true })
  classes: CarClass[];

  @Prop({ required: true })
  columns: number[];

  @Prop({ required: true })
  parts: Part[];

  @Prop({ required: true })
  sizes: Size[];

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

  @Prop({ type: String, required: true })
  role: Role;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
