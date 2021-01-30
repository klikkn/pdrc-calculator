import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { OrderDocument } from './order.schema';

@Injectable()
export class OrdersService {
  constructor(@InjectModel('Order') private orderModel: Model<OrderDocument>) {}
  getMany(params: any): Promise<OrderDocument[]> {
    return this.orderModel.find(params).exec();
  }

  getOne(id: string, params: any): Promise<OrderDocument> {
    return this.orderModel
      .findOne({ ...params, _id: Types.ObjectId(id) })
      .exec();
  }

  createOne(dto: any): Promise<OrderDocument> {
    return this.orderModel.create(dto);
  }

  async updateOne(id: string, params: any, dto: any): Promise<OrderDocument> {
    return this.orderModel.findOneAndUpdate(
      { ...params, _id: Types.ObjectId(id) },
      dto,
      { new: true }
    );
  }

  deleteOne(id: string, params: any): Promise<OrderDocument> {
    return this.orderModel
      .findOneAndRemove({ ...params, _id: Types.ObjectId(id) })
      .exec();
  }
}
