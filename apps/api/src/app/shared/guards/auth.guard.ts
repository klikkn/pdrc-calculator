import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Role } from '@pdrc/api-interfaces';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly roles: Role[]) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const role = req.user.role;
    return this.roles.includes(role);
  }
}
