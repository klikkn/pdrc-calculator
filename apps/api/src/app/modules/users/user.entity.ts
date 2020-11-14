import { Entity, Column } from 'typeorm';
import { DatabaseEntityWithId } from '../../shared';

@Entity()
export class UserEntity extends DatabaseEntityWithId {
  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;
}
