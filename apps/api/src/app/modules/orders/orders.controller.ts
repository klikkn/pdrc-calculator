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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { Role } from '@pdrc/api-interfaces';

import { RolesGuard } from '../../shared/guards/auth.guard';
import {
  OrderCreateRequestDto,
  OrderResponseDto,
  OrderUpdateRequestDto,
} from './orders.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
@ApiBearerAuth()
@UseGuards(new RolesGuard([Role.Admin]))
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  async getMany() {
    const orders = await this.ordersService.getMany({});
    return orders.map((o) => new OrderResponseDto(o.toJSON()));
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const order = await this.ordersService.getOne(id, {});
    if (!order) throw new HttpException({}, HttpStatus.NOT_FOUND);
    return new OrderResponseDto(order.toJSON());
  }

  @Post()
  async createOne(@Body() dto: OrderCreateRequestDto) {
    const order = await this.ordersService.createOne(dto);
    if (!order) throw new HttpException({}, HttpStatus.NOT_FOUND);
    return new OrderResponseDto(order.toJSON());
  }

  @Put(':id')
  async updateOne(
    @Res() res,
    @Param('id') id: string,
    @Body() dto: OrderUpdateRequestDto
  ) {
    const order = await this.ordersService.updateOne(id, {}, dto);
    if (!order) throw new HttpException({}, HttpStatus.NOT_FOUND);
    res.status(HttpStatus.OK).send();
  }

  @Delete(':id')
  async deleteOne(@Param('id') id: string) {
    const order = await this.ordersService.deleteOne(id, {});
    if (!order) throw new HttpException({}, HttpStatus.NOT_FOUND);
  }
}
