import * as bcrypt from 'bcryptjs';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/user.schema';
import { UserRegisterRequestDto } from './auth.dto';
import { DEFAULT_USER_OPTIONS } from '../../shared/consts';

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
    const user = await this.userService.getOneByUsername(username);
    if (!user) return null;

    const validated = await bcrypt.compareSync(password, user.password);
    if (validated) {
      return user;
    }
    return null;
  }

  async login(user: UserDocument) {
    return this.jwtService.sign({ id: user._id });
  }

  async register(dto: UserRegisterRequestDto) {
    const user = await this.userService.createOne({
      ...dto,
      options: DEFAULT_USER_OPTIONS,
    });
    return this.login(user);
  }
}
