import * as bcrypt from 'bcryptjs';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/user.schema';
import {
  UserNewResetLinkDto,
  UserRegisterRequestDto,
  UserResetPasswordDto,
} from './auth.dto';

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
    const user = await this.userService.createOne({ ...dto });
    return this.login(user);
  }

  async createResetToken({ username }: UserNewResetLinkDto) {
    const user = await this.userService.getOneByUsername(username);
    if (!user) return null;

    const resetToken = (Math.floor(Math.random() * 90000) + 10000).toString();
    this.userService.updateOne(user.id, { resetToken });

    return resetToken;
  }

  async resetPassword({
    username,
    password,
    resetToken,
  }: UserResetPasswordDto) {
    const user = await this.userService.getOneByUsername(username);
    if (
      user.resetToken === null ||
      user.resetToken === undefined ||
      String(user.resetToken) !== String(resetToken)
    ) {
      return null;
    }

    const hash = bcrypt.hashSync(password);
    return this.userService.updateOne(user.id, {
      password: hash,
      resetToken: undefined,
    });
  }
}
