import {
  Controller,
  Request,
  Post,
  UseGuards,
  HttpCode,
  Body,
  HttpException,
  HttpStatus,
  Res,
} from '@nestjs/common';

import { Role } from '@pdrc/api-interfaces';
import { ApiBody } from '@nestjs/swagger';

import { Public } from '../../shared/decorators';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import {
  UserRegisterRequestDto,
  UserLoginDto,
  UserResetPasswordDto,
  UserNewResetLinkDto,
} from './auth.dto';
import { DEFAULT_USER_OPTIONS } from '../../shared/consts';
import { SmtpService } from '../../shared/services/smtp.service';
import { Recaptcha } from '@nestlab/google-recaptcha';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private smtpService: SmtpService
  ) {}

  @Public()
  @Recaptcha()
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
        role: Role.User,
      });
      return { access_token };
    } catch (err) {
      //TODO(klikkn) implement errors handler
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  @Public()
  @Recaptcha()
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

  @Public()
  @Recaptcha()
  @HttpCode(200)
  @Post('/reset-link')
  async newResetLink(@Res() res, @Body() dto: UserNewResetLinkDto) {
    if (process.env.PASSWORD_RESET_ENABLED !== 'true') {
      throw new HttpException(
        'Password reset is disabled',
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      const resetToken = await this.authService.createResetToken(dto);
      if (!resetToken) throw new HttpException('', HttpStatus.BAD_REQUEST);

      await this.smtpService.sentResetPasswordEmail(dto.username, resetToken);
      res.status(HttpStatus.OK).send();
    } catch (err) {
      throw new HttpException('', HttpStatus.BAD_REQUEST);
    }
  }

  @Public()
  @Recaptcha()
  @HttpCode(200)
  @Post('/password')
  async resetPassword(@Res() res, @Body() dto: UserResetPasswordDto) {
    if (process.env.PASSWORD_RESET_ENABLED !== 'true') {
      throw new HttpException(
        'Password reset is disabled',
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      const user = await this.authService.resetPassword(dto);
      if (user === null) throw new HttpException('', HttpStatus.BAD_REQUEST);
      res.status(HttpStatus.OK).send();
    } catch (err) {
      throw new HttpException('', HttpStatus.BAD_REQUEST);
    }
  }
}
