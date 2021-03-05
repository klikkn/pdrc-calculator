import { Equals, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { Role, ILogin, IUser } from '@pdrc/api-interfaces';

import { UserCreateRequestDto } from '../users/users.dto';

export class UserNewResetLinkDto implements Pick<UserLoginDto, 'username'> {
  @ApiProperty()
  username: string;
}

export class UserResetPasswordDto
  implements Pick<IUser, 'password' | 'resetToken'> {
  @ApiProperty()
  username: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  resetToken: string;
}

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
