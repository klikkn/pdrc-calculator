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
import { validateOrReject } from 'class-validator';
import { Public } from '../../shared/decorators';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UserRegisterRequestDto, UserRegisterResponseDto } from './dto';
import { serialize } from 'class-transformer';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(200)
  @Post('/register')
  async register(@Body() dto: UserRegisterRequestDto) {
    if (!process.env.REGISTER_ENABLED) {
      throw new HttpException(
        'Registration is disabled',
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      await validateOrReject(new UserRegisterRequestDto(dto));
      const { user, ...rest } = await this.authService.register(dto);
      return {
        ...rest,
        user: JSON.parse(serialize(new UserRegisterResponseDto(user))),
      };
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
    const { user, ...rest } = await this.authService.login(req.user);
    return {
      ...rest,
      user: JSON.parse(serialize(new UserRegisterResponseDto(user))),
    };
  }
}
