import {
  ArrayNotEmpty,
  IsDefined,
  IsEmail,
  IsEmpty,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  registerDecorator,
  ValidateNested,
  ValidationArguments,
} from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';
import { IPriceTable, IUser, IUserOptions } from '@pdrc/api-interfaces';

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

export class UserCreateRequestDto implements Omit<IUser, 'options'> {
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

  @IsEmpty()
  options?: UserOptionsDto;
}

export class UserUpdateRequestDto extends UserCreateRequestDto
  implements IUser {
  @IsEmpty()
  password: string;

  @IsOptional()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => UserOptionsDto)
  options?: UserOptionsDto;
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

  password: string;

  @Expose()
  options?: UserOptionsDto;
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
