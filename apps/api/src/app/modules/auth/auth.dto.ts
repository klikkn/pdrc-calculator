import { Equals, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { Role, ILogin } from '@pdrc/api-interfaces';

import { UserCreateRequestDto } from '../users/users.dto';

export class UserLoginDto implements ILogin {
  @ApiProperty()
  username: string;

  @ApiProperty()
  password: string;
}

export class UserRegisterRequestDto extends UserCreateRequestDto {
  @ApiProperty({ readOnly: true })
  @IsOptional()
  @Equals(undefined)
  role: Role;
}
