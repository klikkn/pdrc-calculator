import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { OrderDocument } from './order.schema';

@Injectable()
export class OrdersService {
  constructor(@InjectModel('Order') private orderModel: Model<OrderDocument>) {}
  getMany(): Promise<OrderDocument[]> {
    return this.orderModel.find().exec();
  }

  getOne(id: string): Promise<OrderDocument> {
    return this.orderModel.findById(id).exec();
  }

  createOne(dto: any): Promise<OrderDocument> {
    return this.orderModel.create(dto);
  }

  async updateOne(id: string, dto: any): Promise<OrderDocument> {
    return this.orderModel.findByIdAndUpdate(id, dto, { new: true });
  }

  async deleteOne(id: string): Promise<OrderDocument> {
    return await this.orderModel.findByIdAndRemove(id);
  }
}
