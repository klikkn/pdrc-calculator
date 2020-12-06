import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { MongooseCrudService } from 'nest-crud-mongoose';

import { UserDocument } from './user.schema';

@Injectable()
export class UsersService extends MongooseCrudService<UserDocument> {
  constructor(@InjectModel('User') model: Model<UserDocument>) {
    super(model);
  }
}
