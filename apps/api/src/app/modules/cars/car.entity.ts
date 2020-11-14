import { Entity, Column } from 'typeorm';
import { DatabaseEntityWithId } from '../../shared';

@Entity()
export class CarEntity extends DatabaseEntityWithId {
  @Column({ type: 'varchar', unique: true })
  title: string;
}
