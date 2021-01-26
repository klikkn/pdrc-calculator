import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Param,
  HttpException,
  HttpStatus,
  Res,
} from '@nestjs/common';

import { OrderCreateRequestDto, OrderUpdateRequestDto } from './orders.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  async getMany() {
    const orders = await this.ordersService.getMany();
    return orders.map((o) => o.toJSON());
  }

  @Get(':id')
  async getOne(@Param('id') id) {
    const order = await this.ordersService.getOne(id);
    return order.toJSON();
  }

  @Post()
  async createOne(@Body() dto: OrderCreateRequestDto) {
    const order = await this.ordersService.createOne(dto);
    return order.toJSON();
  }

  @Put(':id')
  async updateOne(
    @Res() res,
    @Param('id') id,
    @Body() dto: OrderUpdateRequestDto
  ) {
    await this.ordersService.updateOne(id, dto);
    res.status(HttpStatus.OK).send();
  }

  @Delete(':id')
  async deleteOne(@Param('id') id) {
    const order = await this.ordersService.deleteOne(id);
    if (!order) throw new HttpException({}, HttpStatus.NOT_FOUND);
  }
}
