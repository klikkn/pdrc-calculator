import {
  ArrayNotEmpty,
  Equals,
  IsDefined,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  registerDecorator,
  ValidateIf,
  ValidateNested,
  ValidationArguments,
} from 'class-validator';
import { Exclude, Expose, Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import {
  IPriceTable,
  IUser,
  IUserOptions,
  Role,
  Roles,
} from '@pdrc/api-interfaces';

import { UserDocument } from './user.schema';

export class PriceTableDto implements IPriceTable {
  @ApiProperty()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  rows: string[];

  @ApiProperty()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @ArrayNotEmpty()
  values: number[][];
}

export class UserOptionsDto implements IUserOptions {
  @ApiProperty()
  @IsNotEmpty()
  columns: string[];

  @ApiProperty()
  @IsNotEmpty()
  columnsTitle: string;

  @ApiProperty()
  @IsNotEmpty()
  rowsTitle: string;

  @ApiProperty({ type: () => [PriceTableDto] })
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

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Equals(undefined)
  options?: UserOptionsDto;

  @ApiProperty()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ enum: [Roles.Admin, Roles.User] })
  @IsDefined()
  @IsIn([Roles.Admin, Roles.User])
  role: Role;
}

export class UserUpdateRequestDto extends UserCreateRequestDto
  implements IUser {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ required: false })
  @ValidateIf((o) => o.role === Roles.User)
  @IsOptional()
  @ValidateNested()
  @Type(() => UserOptionsDto)
  options: UserOptionsDto;

  //user and admin have different workflows, we cannot update a role. Only create a new user.
  @ApiProperty({ required: false })
  @IsOptional()
  @Equals(undefined)
  role: Role;
}

export class UserResponseDto {
  constructor(partial: Partial<UserDocument>) {
    Object.assign(this, partial);
  }

  @Expose()
  @Transform((value) => value.toString(), { toPlainOnly: true })
  _id: string;

  @Exclude()
  password: string;

  @Exclude()
  __v: string;
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
          if (value === undefined) return false;
          const obj = args.object as IUserOptions;

          return value.every(({ values, rows }) => {
            if (values === undefined || rows === undefined) return false;

            const expectedValuesCount = rows.length * obj.columns.length;
            return values.every((v) => v.length === expectedValuesCount);
          });
        },
      },
    });
  };
}
