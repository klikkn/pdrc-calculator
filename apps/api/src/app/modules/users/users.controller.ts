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
} from '@nestjs/common';

import {
  UserCreateRequestDto,
  UserCreateResponseDto,
  UserUpdateRequestDto,
} from './users.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  getMany() {
    return this.usersService.getMany();
  }

  @Get(':id')
  async getOne(@Param('id') id) {
    const user = await this.usersService.getOne(id);
    return new UserCreateResponseDto(user.toJSON());
  }

  @Post()
  async createOne(@Body() dto: UserCreateRequestDto) {
    //TODO: implement user options
    const user = await this.usersService.createOne(dto);
    return new UserCreateResponseDto(user.toJSON());
  }

  @Put(':id')
  async updateOne(
    @Res() res,
    @Param('id') id,
    @Body() dto: UserUpdateRequestDto
  ) {
    await this.usersService.updateOne(id, dto);
    res.status(HttpStatus.OK).send();
  }

  @Delete(':id')
  async deleteOne(@Param('id') id) {
    const order = await this.usersService.deleteOne(id);
    if (!order) throw new HttpException({}, HttpStatus.NOT_FOUND);
  }
}
