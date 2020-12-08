import { IsEmail, IsNotEmpty } from 'class-validator';
import { Exclude } from 'class-transformer';

export class UserRegisterRequestDto {
  constructor(partial: Partial<UserRegisterRequestDto>) {
    Object.assign(this, partial);
  }

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class UserRegisterResponseDto {
  constructor(partial: Partial<UserRegisterResponseDto>) {
    Object.assign(this, partial);
  }
  email: string;

  @Exclude()
  password: string;
}
