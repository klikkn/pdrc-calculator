import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from '../users/user.schema';
import { IOrder, IOrderItem } from '@pdrc/api-interfaces';

@Schema()
export class Order implements IOrder {
  @Prop()
  carProducer: string;

  @Prop()
  carModel: string;

  @Prop({ required: true })
  category: string;

  @Prop()
  clientName: string;

  @Prop()
  clientPhone: string;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ required: true })
  items: IOrderItem[];

  @Prop({ type: Types.ObjectId, ref: User.name })
  ownerId: string;
}

export type OrderDocument = Order & Document;
export const OrderSchema = SchemaFactory.createForClass(Order);
