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
} from '@nestjs/common';

import { UserCreateRequestDto, UserUpdateRequestDto } from './users.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  getMany() {
    return this.usersService.getMany();
  }

  @Get(':id')
  getOne(@Param('id') id) {
    return this.usersService.getOne(id);
  }

  @Post()
  createOne(@Body() dto: UserCreateRequestDto) {
    return this.usersService.createOne(dto);
  }

  @Put(':id')
  updateOne(@Param('id') id, @Body() dto: UserUpdateRequestDto) {
    return this.usersService.updateOne(id, dto);
  }

  @Delete(':id')
  async deleteOne(@Param('id') id) {
    const order = await this.usersService.deleteOne(id);
    if (!order) throw new HttpException({}, HttpStatus.NOT_FOUND);
  }
}
