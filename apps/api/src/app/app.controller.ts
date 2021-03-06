import { Controller, Get } from '@nestjs/common';
import { Public } from './shared/decorators';

@Controller()
export class AppController {
  @Public()
  @Get('config')
  getConfig() {
    return {
      REGISTER_ENABLED: process.env.REGISTER_ENABLED,
      PASSWORD_RESET_ENABLED: process.env.PASSWORD_RESET_ENABLED,
      GOOGLE_RECAPTCHA_ENABLED: process.env.GOOGLE_RECAPTCHA_ENABLED,
    };
  }
}
