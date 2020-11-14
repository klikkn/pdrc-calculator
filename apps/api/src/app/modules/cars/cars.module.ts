import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CarEntity } from './car.entity';
import { CarsService } from './cars.service';
import { CarsController } from './cars.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CarEntity])],
  providers: [CarsService],
  exports: [CarsService],
  controllers: [CarsController],
})
export class CarsModule {}
