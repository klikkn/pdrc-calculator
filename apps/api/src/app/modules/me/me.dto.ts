import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@pdrc/api-interfaces';
import { Exclude } from 'class-transformer';
import { Equals } from 'class-validator';
import {
  OrderCreateRequestDto,
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

@Exclude()
export class MeResponseDto extends UserResponseDto {}
