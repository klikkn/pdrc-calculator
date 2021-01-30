import { Exclude } from 'class-transformer';
import { Equals, IsOptional } from 'class-validator';
import { Role } from '@pdrc/api-interfaces';
import { UserCreateRequestDto, UserResponseDto } from '../users/users.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UserRegisterRequestDto extends UserCreateRequestDto {
  @ApiProperty({ readOnly: true })
  @IsOptional()
  @Equals(undefined)
  role: Role;
}

@Exclude()
export class UserRegisterResponseDto extends UserResponseDto {}
