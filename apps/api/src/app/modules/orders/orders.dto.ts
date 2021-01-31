import {
  ArrayNotEmpty,
  IsEmpty,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Transform, Type } from 'class-transformer';

import { IOrder, IOrderItem } from '@pdrc/api-interfaces';

import { OrderDocument } from './order.schema';

export class OrderCreateRequestDto implements IOrder {
  constructor(partial: Partial<OrderCreateRequestDto>) {
    Object.assign(this, partial);
  }

  @IsEmpty()
  _id?: string;

  @ApiProperty({ required: false })
  carModel: string;

  @ApiProperty({ required: false })
  carProducer: string;

  @ApiProperty()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ required: false })
  clientName: string;

  @ApiProperty({ required: false })
  clientPhone: string;

  @ApiProperty()
  @IsNotEmpty()
  date: Date;

  @ApiProperty({ type: () => [OrderItemDto] })
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty()
  @IsNotEmpty()
  ownerId: string;
}

class OrderItemDto implements IOrderItem {
  @ApiProperty()
  @IsNotEmpty()
  column: string;

  @ApiProperty()
  @IsNotEmpty()
  count: number;

  @ApiProperty()
  @IsNotEmpty()
  part: string;
  row: string;

  @ApiProperty()
  @IsNotEmpty()
  table: string;

  @ApiProperty()
  @IsNotEmpty()
  value: number;
}

export class OrderUpdateRequestDto extends OrderCreateRequestDto {}

export class OrderResponseDto {
  constructor(partial: Partial<OrderDocument>) {
    Object.assign(this, partial);
  }

  @Transform((value) => value.toString(), { toPlainOnly: true })
  _id: string;

  @Exclude()
  __v: string;

  @Transform((value) => value.toString(), { toPlainOnly: true })
  ownerId: string;
}
