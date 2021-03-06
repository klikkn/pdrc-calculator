import { Injectable } from '@nestjs/common';

import * as mailer from 'nodemailer';

@Injectable()
export class SmtpService {
  sentResetPasswordEmail(email: string, code: string) {
    console.log(process.env.GMAIL_SMTP_USER, process.env.GMAIL_SMTP_PASSWORD);

    const transporter = mailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_SMTP_USER,
        pass: process.env.GMAIL_SMTP_PASSWORD,
      },
    });

    const options = {
      to: email,
      subject: 'PDRC: Password reset',
      text: `This is your code ${code}`,
    };

    return transporter.sendMail(options);
  }
}
