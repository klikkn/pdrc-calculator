import { Injectable } from '@nestjs/common';

import { SmtpService } from './smtp.service';

@Injectable()
export class SmtpFakeService extends SmtpService {
  async sentResetPasswordEmail(email: string, code: string) {
    console.log('Password reset data:', email, code);
    return true;
  }
}
