import { Exclude } from 'class-transformer';
import { IsEmpty } from 'class-validator';
import { Role } from '@pdrc/api-interfaces';
import {
  UserCreateRequestDto,
  UserCreateResponseDto,
} from '../users/users.dto';

export class UserRegisterRequestDto extends UserCreateRequestDto {
  @IsEmpty()
  role: Role;
}

@Exclude()
export class UserRegisterResponseDto extends UserCreateResponseDto {}
