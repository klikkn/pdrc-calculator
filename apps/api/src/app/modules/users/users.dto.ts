import {
  ArrayNotEmpty,
  IsEmail,
  IsEmpty,
  IsIn,
  IsNotEmpty,
  IsNotEmptyObject,
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

  @IsEmpty()
  _id?: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsEmpty()
  options?: UserOptionsDto;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @IsIn([Roles.Admin, Roles.User])
  role: Role;
}

export class UserUpdateRequestDto extends UserCreateRequestDto
  implements IUser {
  @IsOptional()
  password: string;

  @ValidateIf((o) => o.role === Roles.User)
  @IsNotEmpty()
  @IsOptional()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => UserOptionsDto)
  options?: UserOptionsDto;

  @IsEmpty()
  role: Role;
}

@Exclude()
export class UserCreateResponseDto
  implements Pick<UserDocument, '_id' | 'email' | 'password' | 'options'> {
  constructor(partial: Partial<UserCreateResponseDto>) {
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
