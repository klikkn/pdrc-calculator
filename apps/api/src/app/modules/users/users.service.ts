import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { MongooseCrudService } from 'nest-crud-mongoose';

import { User, UserDocument } from './user.schema';

@Injectable()
export class UsersService extends MongooseCrudService<UserDocument> {
  constructor(@InjectModel('User') private model: Model<UserDocument>) {
    super(model);
  }

  async create(user: User) {
    return this.model.create({
      email: user.email,
      password: user.password,
    });
  }
}
