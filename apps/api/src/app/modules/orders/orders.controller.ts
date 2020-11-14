import { Controller } from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';

import { OrderEntity } from './order.entity';
import { OrdersService } from './orders.service';

@Crud({
  model: {
    type: OrderEntity,
  },
  params: {
    id: {
      type: 'uuid',
      primary: true,
      field: 'id',
    },
  },
})
@Controller('orders')
export class OrdersController implements CrudController<OrderEntity> {
  constructor(public service: OrdersService) {}
}
