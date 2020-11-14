import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';

import { CarEntity } from './car.entity';

@Injectable()
export class CarsService extends TypeOrmCrudService<CarEntity> {
  constructor(@InjectRepository(CarEntity) repo) {
    super(repo);
  }
}
