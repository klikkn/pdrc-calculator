import {
  Controller,
  Get,
  Body,
  Put,
  HttpStatus,
  Request,
  Res,
} from '@nestjs/common';

import { UsersService } from '../users/users.service';
import { MeResponseDto, MeUpdateRequestDto } from './me.dto';

@Controller('me')
export class MeController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getOne(@Request() req) {
    const user = await this.usersService.getOne(req.user.id);
    return new MeResponseDto(user.toJSON());
  }

  @Put()
  async updateOne(@Res() res, @Request() req, @Body() dto: MeUpdateRequestDto) {
    await this.usersService.updateOne(req.user.id, dto);
    res.status(HttpStatus.OK).send();
  }
}
