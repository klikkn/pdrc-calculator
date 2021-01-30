import { Exclude } from 'class-transformer';
import { Equals } from 'class-validator';
import {
  OrderCreateRequestDto,
  OrderUpdateRequestDto,
} from '../orders/orders.dto';
import { UserResponseDto, UserUpdateRequestDto } from '../users/users.dto';

export class MeUpdateRequestDto extends UserUpdateRequestDto {}

export class MeCreateOrderRequestDto extends OrderCreateRequestDto {
  @Equals(undefined)
  ownerId: string;
}

export class MeUpdateOrderRequestDto extends OrderUpdateRequestDto {
  @Equals(undefined)
  ownerId: string;
}

@Exclude()
export class MeResponseDto extends UserResponseDto {}
