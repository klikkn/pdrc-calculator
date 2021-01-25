import { Exclude } from 'class-transformer';
import { Equals, IsOptional } from 'class-validator';
import { Role } from '@pdrc/api-interfaces';
import { UserCreateRequestDto, UserResponseDto } from '../users/users.dto';

export class UserRegisterRequestDto extends UserCreateRequestDto {
  @IsOptional()
  @Equals(undefined)
  role: Role;
}

@Exclude()
export class UserRegisterResponseDto extends UserResponseDto {}
