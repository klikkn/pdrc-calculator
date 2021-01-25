import { Exclude } from 'class-transformer';
import { UserResponseDto, UserUpdateRequestDto } from '../users/users.dto';

export class MeUpdateRequestDto extends UserUpdateRequestDto {}

@Exclude()
export class MeResponseDto extends UserResponseDto {}
