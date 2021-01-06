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
} from '@nestjs/common';

import { OrderCreateRequestDto, OrderUpdateRequestDto } from './orders.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  getMany() {
    return this.ordersService.getMany();
  }

  @Get(':id')
  getOne(@Param('id') id) {
    return this.ordersService.getOne(id);
  }

  @Post()
  createOne(@Body() dto: OrderCreateRequestDto) {
    return this.ordersService.createOne(dto);
  }

  @Put(':id')
  updateOne(@Param('id') id, @Body() dto: OrderUpdateRequestDto) {
    return this.ordersService.updateOne(id, dto);
  }

  @Delete(':id')
  async deleteOne(@Param('id') id) {
    const order = await this.ordersService.deleteOne(id);
    if (!order) throw new HttpException({}, HttpStatus.NOT_FOUND);
  }
}
