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

import { Public } from '../../shared/decorators';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { UserRegisterRequestDto } from './auth.dto';
import { Roles } from '@pdrc/api-interfaces';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(200)
  @Post('/register')
  async register(@Body() dto: UserRegisterRequestDto) {
    if (process.env.REGISTER_ENABLED === 'false') {
      throw new HttpException(
        'Registration is disabled',
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      const access_token = await this.authService.register({
        ...dto,
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
