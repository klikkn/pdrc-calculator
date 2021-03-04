import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Param,
  HttpException,
  HttpStatus,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { Role } from '@pdrc/api-interfaces';

import { DEFAULT_USER_OPTIONS } from '../../shared/consts';
import { RolesGuard } from '../../shared/guards/auth.guard';
import {
  UserCreateRequestDto,
  UserResponseDto,
  UserUpdateRequestDto,
} from './users.dto';
import { UsersService } from './users.service';

@Controller('users')
@ApiBearerAuth()
@UseGuards(new RolesGuard([Role.Admin]))
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getMany() {
    const users = await this.usersService.getMany();
    return users.map((u) => new UserResponseDto(u.toJSON()));
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const user = await this.usersService.getOne(id);
    return new UserResponseDto(user.toJSON());
  }

  @Post()
  async createOne(@Body() dto: UserCreateRequestDto) {
    //TODO: implement user options
    const user = await this.usersService.createOne({
      ...dto,
      options: dto.role === Role.User ? DEFAULT_USER_OPTIONS : undefined,
    });
    return new UserResponseDto(user.toJSON());
  }

  @Put(':id')
  async updateOne(
    @Res() res,
    @Param('id') id: string,
    @Body() dto: UserUpdateRequestDto
  ) {
    await this.usersService.updateOne(id, dto);
    res.status(HttpStatus.OK).send();
  }

  @Delete(':id')
  async deleteOne(@Param('id') id: string) {
    const order = await this.usersService.deleteOne(id);
    if (!order) throw new HttpException({}, HttpStatus.NOT_FOUND);
  }
}
