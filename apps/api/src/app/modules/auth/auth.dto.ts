import { Exclude } from 'class-transformer';
import {
  UserCreateRequestDto,
  UserCreateResponseDto,
} from '../users/users.dto';

export class UserRegisterRequestDto extends UserCreateRequestDto {}

@Exclude()
export class UserRegisterResponseDto extends UserCreateResponseDto {}
