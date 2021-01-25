import {
  ArrayNotEmpty,
  Equals,
  IsDefined,
  IsEmail,
  IsEmpty,
  IsIn,
  IsNotEmpty,
  IsOptional,
  registerDecorator,
  ValidateIf,
  ValidateNested,
  ValidationArguments,
} from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';
import {
  IPriceTable,
  IUser,
  IUserOptions,
  Role,
  Roles,
} from '@pdrc/api-interfaces';

import { UserDocument } from './user.schema';
import { isNullOrUndefined, isUndefined } from 'util';

class PriceTableDto implements IPriceTable {
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  rows: string[];

  @IsNotEmpty()
  title: string;

  @ArrayNotEmpty()
  values: number[][];
}

export class UserOptionsDto implements IUserOptions {
  @IsNotEmpty()
  columns: string[];

  @IsNotEmpty()
  columnsTitle: string;

  @IsNotEmpty()
  rowsTitle: string;

  @ArrayNotEmpty()
  @PriceTableArray()
  @ValidateNested({ each: true })
  @Type(() => PriceTableDto)
  tables: PriceTableDto[];
}

export class UserCreateRequestDto implements IUser {
  constructor(partial: Partial<UserCreateRequestDto>) {
    Object.assign(this, partial);
  }

  @Equals(undefined)
  _id?: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Equals(undefined)
  options?: UserOptionsDto;

  @IsNotEmpty()
  password: string;

  @IsDefined()
  @IsIn([Roles.Admin, Roles.User])
  role: Role;
}

export class UserUpdateRequestDto extends UserCreateRequestDto
  implements IUser {
  @IsOptional()
  @IsNotEmpty()
  password: string;

  @ValidateIf((o) => o.role === Roles.User)
  @IsOptional()
  @ValidateNested()
  @Type(() => UserOptionsDto)
  options: UserOptionsDto;

  //user and admin have different workflows, we cannot update a role. Only create a new user.
  @IsOptional()
  @Equals(undefined)
  role: Role;
}

@Exclude()
export class UserResponseDto
  implements Pick<UserDocument, '_id' | 'email' | 'password' | 'options'> {
  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  _id: string;

  @Expose()
  email: string;

  @Expose()
  options?: UserOptionsDto;

  password: string;

  @Expose()
  role: Role;
}

function PriceTableArray() {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'IsPriceTableArray',
      target: object.constructor,
      propertyName,
      constraints: [],
      validator: {
        validate(value, args: ValidationArguments) {
          if (!value) return false;
          const obj = args.object as IUserOptions;

          return value.every(({ values, rows }) => {
            const expectedValuesCount = rows.length * obj.columns.length;
            return values.every((v) => v.length === expectedValuesCount);
          });
        },
      },
    });
  };
}
