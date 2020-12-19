import { IsEmail, IsNotEmpty } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

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

@Exclude()
export class UserRegisterResponseDto {
  constructor(partial: Partial<UserRegisterResponseDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  email: string;

  password: string;
}
