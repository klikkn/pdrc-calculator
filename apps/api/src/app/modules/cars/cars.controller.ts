import { Controller } from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';

import { CarEntity } from './car.entity';
import { CarsService } from './cars.service';

@Crud({
  model: {
    type: CarEntity,
  },
  params: {
    id: {
      type: 'uuid',
      primary: true,
      field: 'id',
    },
  },
})
@Controller('Cars')
export class CarsController implements CrudController<CarEntity> {
  constructor(public service: CarsService) {}
}
