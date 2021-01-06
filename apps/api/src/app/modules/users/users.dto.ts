import { IsEmail, IsEmpty, IsNotEmpty } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

export class UserCreateRequestDto {
  constructor(partial: Partial<UserCreateRequestDto>) {
    Object.assign(this, partial);
  }

  @IsEmpty()
  _id?: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class UserUpdateRequestDto extends UserCreateRequestDto {
  @IsEmpty()
  password: string;
}

@Exclude()
export class UserCreateResponseDto {
  constructor(partial: Partial<UserCreateResponseDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  _id: string;

  @Expose()
  email: string;

  password: string;
}
