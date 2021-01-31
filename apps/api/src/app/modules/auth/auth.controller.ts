import {
  Controller,
  Request,
  Post,
  UseGuards,
  HttpCode,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { Roles } from '@pdrc/api-interfaces';
import { ApiBody } from '@nestjs/swagger';

import { Public } from '../../shared/decorators';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { UserRegisterRequestDto, UserLoginDto } from './auth.dto';
import { DEFAULT_USER_OPTIONS } from '../../shared/consts';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(200)
  @Post('/register')
  async register(@Body() dto: UserRegisterRequestDto) {
    if (process.env.REGISTER_ENABLED !== 'true') {
      throw new HttpException(
        'Registration is disabled',
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      const access_token = await this.authService.register({
        ...dto,
        options: DEFAULT_USER_OPTIONS,
        role: Roles.User,
      });
      return { access_token };
    } catch (err) {
      //TODO(klikkn) implement errors handler
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @Post('/login')
  @ApiBody({ type: UserLoginDto })
  async login(@Request() req) {
    try {
      const access_token = await this.authService.login(req.user);
      return { access_token };
    } catch (err) {
      //TODO(klikkn) implement errors handler
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }
}
