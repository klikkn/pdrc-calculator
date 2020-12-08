import bcrypt from 'bcryptjs';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/user.schema';
import { UserRegisterRequestDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(
    username: string,
    password: string
  ): Promise<UserDocument> {
    const user = await this.userService.findOne({ email: username });
    if (!user) return null;

    const validated = await bcrypt.compareSync(password, user.password);
    if (validated) {
      return user;
    }
    return null;
  }

  async login(user: UserDocument) {
    const payload = {
      id: user._id,
    };

    return {
      user: user,
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(dto: UserRegisterRequestDto) {
    const user = await this.userService.create(dto);
    return this.login(user);
  }
}
