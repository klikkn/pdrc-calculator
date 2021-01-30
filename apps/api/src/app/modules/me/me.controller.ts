import {
  Controller,
  Get,
  Body,
  Put,
  HttpStatus,
  Request,
  Res,
  Param,
  Delete,
  Post,
  HttpException,
} from '@nestjs/common';

import { OrdersService } from '../orders/orders.service';
import { UsersService } from '../users/users.service';
import {
  MeCreateOrderRequestDto,
  MeResponseDto,
  MeUpdateOrderRequestDto,
  MeUpdateRequestDto,
} from './me.dto';

@Controller('me')
export class MeController {
  constructor(
    private usersService: UsersService,
    private ordersService: OrdersService
  ) {}

  @Get()
  async getOne(@Request() req) {
    const user = await this.usersService.getOne(req.user.id);
    return new MeResponseDto(user.toJSON());
  }

  @Put()
  async updateOne(@Res() res, @Request() req, @Body() dto: MeUpdateRequestDto) {
    await this.usersService.updateOne(req.user.id, dto);
    res.status(HttpStatus.OK).send();
  }

  @Get('orders/')
  async getManyOrders(@Request() req) {
    const orders = await this.ordersService.getMany({ ownerId: req.user._id });
    return orders.map((o) => o.toJSON());
  }

  @Get('orders/:id')
  async getOneOrder(@Request() req, @Param('id') id) {
    const order = await this.ordersService.getOne(id, {
      ownerId: req.user._id,
    });
    if (!order) throw new HttpException({}, HttpStatus.NOT_FOUND);
    return order.toJSON();
  }

  @Post('orders')
  async createOne(@Request() req, @Body() dto: MeCreateOrderRequestDto) {
    const order = await this.ordersService.createOne({
      ...dto,
      ownerId: req.user._id,
    });
    return order.toJSON();
  }

  @Put('orders/:id')
  async updateOrder(
    @Res() res,
    @Request() req,
    @Param('id') id,
    @Body() dto: MeUpdateOrderRequestDto
  ) {
    const order = await this.ordersService.updateOne(
      id,
      { ownerId: req.user._id },
      dto
    );
    if (!order) throw new HttpException({}, HttpStatus.NOT_FOUND);
    res.status(HttpStatus.OK).send();
  }

  @Delete('orders/:id')
  async deleteOrder(@Request() req, @Param('id') id) {
    const order = await this.ordersService.deleteOne(id, {
      ownerId: req.user._id,
    });
    if (!order) throw new HttpException({}, HttpStatus.NOT_FOUND);
  }
}
