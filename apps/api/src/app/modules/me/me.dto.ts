import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Equals } from 'class-validator';

import { Role } from '@pdrc/api-interfaces';

import { OrderDocument } from '../orders/order.schema';
import {
  OrderCreateRequestDto,
  OrderResponseDto,
  OrderUpdateRequestDto,
} from '../orders/orders.dto';
import { UserResponseDto, UserUpdateRequestDto } from '../users/users.dto';

export class MeUpdateRequestDto extends UserUpdateRequestDto {
  @ApiProperty({ readOnly: true })
  @Equals(undefined)
  role: Role;
}

export class MeCreateOrderRequestDto extends OrderCreateRequestDto {
  @ApiProperty({ readOnly: true })
  @Equals(undefined)
  ownerId: string;
}

export class MeUpdateOrderRequestDto extends OrderUpdateRequestDto {
  @ApiProperty({ readOnly: true })
  @Equals(undefined)
  ownerId: string;
}

export class MeResponseDto extends UserResponseDto {}

export class MeOrderResponseDto extends OrderResponseDto {
  constructor(partial: Partial<OrderDocument>) {
    super(partial);
  }

  @Exclude()
  ownerId: string;
}
