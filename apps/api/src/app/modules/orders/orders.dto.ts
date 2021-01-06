import {
  ArrayNotEmpty,
  IsEmpty,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { IOrder, IOrderItem } from '@pdrc/api-interfaces';
import { Type } from 'class-transformer';

export class OrderCreateRequestDto implements Omit<IOrder, 'ownerId'> {
  constructor(partial: Partial<OrderCreateRequestDto>) {
    Object.assign(this, partial);
  }

  @IsEmpty()
  _id?: string;

  carModel: string;

  carProducer: string;

  @IsNotEmpty()
  category: string;

  clientName: string;

  clientPhone: string;

  @IsNotEmpty()
  date: Date;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsNotEmpty()
  ownerId: string;
}

class OrderItemDto implements IOrderItem {
  @IsNotEmpty()
  count: number;

  @IsNotEmpty()
  value: string;

  @IsNotEmpty()
  part: string;

  @IsNotEmpty()
  unitPrice: number;
}

export class OrderUpdateRequestDto extends OrderCreateRequestDto {}
