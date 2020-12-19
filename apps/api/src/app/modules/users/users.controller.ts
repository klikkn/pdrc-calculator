import { Controller } from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';
import { User } from './user.schema';
import { UsersService } from './users.service';

@Crud({
  model: {
    type: User,
  },
  params: {
    id: {
      type: 'string',
      primary: true,
      field: '_id',
    },
  },
  serialize: {
    get: false,
    getMany: false,
    createMany: false,
    create: false,
    update: false,
    replace: false,
    delete: false,
  },
})
@Controller('users')
export class UsersController implements CrudController<User> {
  constructor(public service: UsersService) {}
}
