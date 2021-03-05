import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';

import { UserDocument } from './user.schema';
import { UserCreateRequestDto, UserUpdateRequestDto } from './users.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private userModel: Model<UserDocument>) {}
  getMany(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  getOne(id: string): Promise<UserDocument> {
    return this.userModel.findById(id).exec();
  }

  createOne(dto: UserCreateRequestDto): Promise<UserDocument> {
    return this.userModel.create(dto);
  }

  async updateOne(
    id: string,
    dto: UserUpdateRequestDto
  ): Promise<UserDocument> {
    return this.userModel.findByIdAndUpdate(id, dto, { new: true });
  }

  async deleteOne(id: string): Promise<UserDocument> {
    return await this.userModel.findByIdAndRemove(id);
  }

  async getOneByUsername(username: string): Promise<UserDocument> {
    return this.userModel.findOne({ email: username }).exec();
  }
}
